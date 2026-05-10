function adminToken() {
  return localStorage.getItem("adminToken") || "";
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const token = adminToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(path, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "请求失败");
  return data;
}

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setMessage(selector, text) {
  document.querySelector(selector).textContent = text;
}

function showDashboard(show) {
  document.querySelector("[data-admin-login]").hidden = show;
  document.querySelector("[data-admin-dashboard]").hidden = !show;
}

async function loadRecords() {
  const data = await api("/api/admin/records");
  document.querySelector("[data-key-list]").innerHTML = data.keys.map((item) => `
    <tr>
      <td>${escapeHtml(item.boss)}</td>
      <td><code>${escapeHtml(item.key)}</code></td>
      <td>${item.used ? "已使用" : "未使用"}</td>
      <td>${formatTime(item.createdAt)}</td>
      <td>${formatTime(item.usedAt)}</td>
    </tr>
  `).join("") || '<tr><td colspan="5">暂无密钥</td></tr>';

  document.querySelector("[data-record-list]").innerHTML = data.records.map((item) => `
    <tr>
      <td>${escapeHtml(item.boss)}</td>
      <td><code>${escapeHtml(item.key)}</code></td>
      <td>${escapeHtml(item.result.tool.name)}</td>
      <td>${escapeHtml(item.result.prize.name)}</td>
      <td>${escapeHtml(item.result.scene.name)}</td>
      <td>${formatTime(item.usedAt)}</td>
    </tr>
  `).join("") || '<tr><td colspan="6">暂无使用记录</td></tr>';
}

document.querySelector("[data-login-form]").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    const data = await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password")
      })
    });
    localStorage.setItem("adminToken", data.token);
    showDashboard(true);
    await loadRecords();
  } catch (error) {
    setMessage("[data-login-message]", error.message);
  }
});

document.querySelector("[data-key-form]").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const data = await api("/api/admin/keys", {
    method: "POST",
    body: JSON.stringify({ boss: form.get("boss") })
  });
  document.querySelector("[data-new-key]").hidden = false;
  document.querySelector("[data-new-key-text]").textContent = data.key.key;
  event.currentTarget.reset();
  await loadRecords();
});

document.querySelector("[data-copy-key]").addEventListener("click", async () => {
  const text = document.querySelector("[data-new-key-text]").textContent;
  await navigator.clipboard.writeText(text);
});

document.querySelector("[data-admin-logout]").addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  showDashboard(false);
});

if (adminToken()) {
  showDashboard(true);
  loadRecords().catch(() => {
    localStorage.removeItem("adminToken");
    showDashboard(false);
  });
}
