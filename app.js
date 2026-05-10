const tools = [
  { name: "洛阳铲", note: "探土辨层，先开一线。", icon: "shovel" },
  { name: "摸金符", note: "护身定心，入局不乱。", icon: "talisman" },
  { name: "寻龙尺", note: "循脉寻向，取势定门。", icon: "ruler" },
  { name: "命灯", note: "照影观风，明暗自分。", icon: "lamp" },
  { name: "镇尸钉", note: "封煞镇位，稳住阵脚。", icon: "nail" }
];

const prizes = [
  { name: "青铜兽面", note: "一号目标", image: "image/processed/1.png" },
  { name: "古玉残璧", note: "二号目标", image: "image/processed/2.png" },
  { name: "鎏金铜铃", note: "三号目标", image: "image/processed/3.png" },
  { name: "残卷秘符", note: "四号目标", image: "image/processed/4.png" },
  { name: "玄铁钥匙", note: "五号目标", image: "image/processed/5.png" },
  { name: "星盘碎片", note: "六号目标", image: "image/processed/6.png" },
  { name: "夜明珠", note: "七号目标", image: "image/processed/7.png" }
];

const scenes = [
  { name: "墓道", note: "石阶深处，风声回旋。", icon: "tunnel" },
  { name: "耳室", note: "侧室藏物，灯影斜落。", icon: "chamber" },
  { name: "主墓室", note: "棺椁居中，机关暗伏。", icon: "tomb" }
];

const icons = {
  shovel: '<path d="M18 4l8 8"/><path d="M14 8l10 10"/><path d="M4 28l12-12"/><path d="M10 22l4 4"/><path d="M21 5l6 6-3 3-6-6z"/>',
  talisman: '<path d="M10 3h12l4 6v18H6V9z"/><path d="M10 9h12"/><path d="M12 15h8"/><path d="M12 21h4"/><path d="M20 20l2 3 3-6"/>',
  ruler: '<path d="M5 25L25 5l4 4L9 29z"/><path d="M18 8l3 3"/><path d="M14 12l2 2"/><path d="M10 16l3 3"/>',
  lamp: '<path d="M11 14h10l2 12H9z"/><path d="M13 14V8a3 3 0 0 1 6 0v6"/><path d="M12 26h8"/><path d="M16 2v3"/>',
  nail: '<path d="M16 3l7 7-4 4-7-7z"/><path d="M12 7L5 27l20-7"/><path d="M9 20l3 3"/>',
  mask: '<path d="M7 7c4-3 14-3 18 0v8c0 7-4 12-9 14-5-2-9-7-9-14z"/><path d="M11 15h5"/><path d="M16 15h5"/><path d="M13 22h6"/><path d="M16 18v3"/>',
  jade: '<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="4"/><path d="M16 5v7"/><path d="M16 20v7"/>',
  bell: '<path d="M9 24h14"/><path d="M11 24V13a5 5 0 0 1 10 0v11"/><path d="M14 27a2 2 0 0 0 4 0"/><path d="M15 6h2"/>',
  scroll: '<path d="M8 7h14v18H8z"/><path d="M8 7c-3 0-3 5 0 5"/><path d="M22 20c3 0 3 5 0 5"/><path d="M12 13h7"/><path d="M12 18h5"/>',
  key: '<circle cx="11" cy="12" r="5"/><path d="M15 16l10 10"/><path d="M21 22l3-3"/><path d="M24 25l3-3"/>',
  compass: '<circle cx="16" cy="16" r="12"/><path d="M20 8l-3 11-5 5 3-11z"/><path d="M16 4v3"/><path d="M16 25v3"/>',
  orb: '<circle cx="16" cy="16" r="10"/><path d="M11 11c2-2 6-2 8 0"/><path d="M8 22h16"/><path d="M12 27h8"/>',
  tunnel: '<path d="M6 28V15a10 10 0 0 1 20 0v13"/><path d="M11 28V16a5 5 0 0 1 10 0v12"/><path d="M4 28h24"/>',
  chamber: '<path d="M5 26h22"/><path d="M7 26V8h18v18"/><path d="M11 26V14h10v12"/><path d="M10 8V5h12v3"/>',
  tomb: '<path d="M6 27h20"/><path d="M9 27V10l7-5 7 5v17"/><path d="M13 27V16h6v11"/><path d="M12 11h8"/>'
};

function icon(name) {
  return `<svg viewBox="0 0 32 32" aria-hidden="true">${icons[name] || icons.orb}</svg>`;
}

function prizeVisual(item) {
  if (item.image) {
    return `<button class="prize-image" type="button" data-preview="${item.image}" data-preview-title="${item.name}" aria-label="查看${item.name}详情"><img src="${item.image}" alt="${item.name}"></button>`;
  }
  return `<span class="prize-icon">${icon(item.icon)}</span>`;
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function resetLottery() {
  localStorage.removeItem("lotteryTool");
  localStorage.removeItem("lotteryPrize");
  localStorage.removeItem("lotteryScene");
  localStorage.removeItem("lotteryKey");
  localStorage.removeItem("lotteryBoss");
  localStorage.removeItem("lotterySubmitted");
  window.location.href = "/index";
}

function bindResetButtons() {
  document.querySelectorAll("[data-reset]").forEach((button) => {
    button.addEventListener("click", resetLottery);
  });
}

function showModal(title, message, href) {
  const modal = document.querySelector("[data-modal]");
  if (!modal) return;
  modal.querySelector("[data-modal-title]").textContent = title;
  modal.querySelector("[data-modal-message]").textContent = message;
  const action = modal.querySelector("[data-modal-action]");
  action.href = href;
  modal.classList.add("open");
}

function bindImagePreview() {
  const viewer = document.querySelector("[data-image-viewer]");
  if (!viewer) return;
  const image = viewer.querySelector("[data-preview-image]");
  const title = viewer.querySelector("[data-preview-title]");

  const close = () => {
    viewer.classList.remove("open");
    image.removeAttribute("src");
    image.removeAttribute("alt");
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-preview]");
    if (trigger) {
      image.src = trigger.dataset.preview;
      image.alt = trigger.dataset.previewTitle || "摸金目标";
      title.textContent = trigger.dataset.previewTitle || "摸金目标";
      viewer.classList.add("open");
      return;
    }
    if (event.target.closest("[data-preview-close]") || event.target === viewer) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && viewer.classList.contains("open")) close();
  });
}

async function postJson(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "请求失败");
  return data;
}

function clearLocalProgress() {
  localStorage.removeItem("lotteryTool");
  localStorage.removeItem("lotteryPrize");
  localStorage.removeItem("lotteryScene");
  localStorage.removeItem("lotterySubmitted");
}

function applyProgress(progress = {}) {
  if (progress.tool) save("lotteryTool", progress.tool);
  else localStorage.removeItem("lotteryTool");
  if (progress.prize) save("lotteryPrize", progress.prize);
  else localStorage.removeItem("lotteryPrize");
  if (progress.scene) save("lotteryScene", progress.scene);
  else localStorage.removeItem("lotteryScene");
}

function nextPath(progress = {}) {
  if (progress.scene) return "result.html";
  if (progress.prize) return "scene.html";
  if (progress.tool) return "draw.html";
  return "";
}

async function verifyCurrentKey() {
  const key = localStorage.getItem("lotteryKey");
  if (!key) throw new Error("密钥未验证");
  const data = await postJson("/api/key/verify", { key });
  localStorage.setItem("lotteryBoss", data.boss);
  applyProgress(data.progress);
  return data;
}

async function bindStep(step, value) {
  const key = localStorage.getItem("lotteryKey");
  if (!key) throw new Error("密钥未验证");
  const data = await postJson("/api/key/progress", { key, step, value });
  applyProgress(data.progress);
  return data;
}

function setText(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
}

function renderToolPage() {
  const grid = document.querySelector("[data-tools]");
  const next = document.querySelector("[data-next]");
  const keyForm = document.querySelector("[data-key-form]");
  let selected = load("lotteryTool");
  let verifiedKey = localStorage.getItem("lotteryKey") || "";

  grid.innerHTML = tools.map((item, index) => `
    <button class="option-card ${selected && selected.name === item.name ? "selected" : ""}" type="button" data-index="${index}">
      <span class="option-icon">${icon(item.icon)}</span>
      <span class="card-title">${item.name}</span>
      <span class="card-subtitle">${item.note}</span>
    </button>
  `).join("");

  next.disabled = !selected || !verifiedKey;
  if (verifiedKey) {
    keyForm.querySelector("input").value = verifiedKey;
    setText("[data-key-message]", `密钥已验证：${localStorage.getItem("lotteryBoss") || ""}`);
  }

  keyForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const key = new FormData(keyForm).get("key").trim().toUpperCase();
    if (!key) {
      setText("[data-key-message]", "请输入密钥");
      return;
    }
    try {
      const data = await postJson("/api/key/verify", { key });
      localStorage.setItem("lotteryKey", data.key);
      localStorage.setItem("lotteryBoss", data.boss);
      clearLocalProgress();
      applyProgress(data.progress);
      verifiedKey = data.key;
      setText("[data-key-message]", `密钥已验证：${data.boss}`);
      const path = nextPath(data.progress);
      if (path) {
        window.location.href = path;
        return;
      }
      selected = null;
      document.querySelectorAll(".option-card").forEach((node) => node.classList.remove("selected"));
      next.disabled = true;
    } catch (error) {
      verifiedKey = "";
      localStorage.removeItem("lotteryKey");
      localStorage.removeItem("lotteryBoss");
      clearLocalProgress();
      setText("[data-key-message]", error.message);
      next.disabled = true;
    }
  });

  grid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-index]");
    if (!card) return;
    selected = tools[Number(card.dataset.index)];
    save("lotteryTool", selected);
    document.querySelectorAll(".option-card").forEach((node) => node.classList.remove("selected"));
    card.classList.add("selected");
    next.disabled = !verifiedKey;
  });

  next.addEventListener("click", async () => {
    if (!verifiedKey) {
      showModal("密钥未验证", "请先输入老板给你的密钥，并通过后台校验。", "#");
      return;
    }
    if (!selected) {
      showModal("还没有选择道具", "先从五个道具里选一个，再进入下一步。", "#");
      return;
    }
    next.disabled = true;
    try {
      await verifyCurrentKey();
      await bindStep("tool", selected);
      window.location.href = "draw.html";
    } catch (error) {
      showModal("无法继续", error.message, "/index");
      next.disabled = false;
    }
  });
}

function renderDrawPage() {
  if (!localStorage.getItem("lotteryKey") || !load("lotteryTool")) {
    window.location.href = "/index";
    return;
  }

  const grid = document.querySelector("[data-prizes]");
  const button = document.querySelector("[data-draw]");
  const next = document.querySelector("[data-next]");
  let timer = null;
  let active = 0;
  let result = load("lotteryPrize");

  grid.innerHTML = prizes.map((item, index) => `
    <div class="prize-card ${result && result.name === item.name ? "active" : ""}" data-index="${index}">
      ${prizeVisual(item)}
      <p class="card-title">${item.name}</p>
      <p class="card-subtitle">${item.note}</p>
    </div>
  `).join("");
  button.disabled = Boolean(result);
  next.disabled = !result;

  button.addEventListener("click", async () => {
    if (result) return;
    button.disabled = true;
    next.disabled = true;
    try {
      await verifyCurrentKey();
    } catch (error) {
      showModal("密钥校验失败", error.message, "/index");
      return;
    }
    let ticks = 0;
    timer = window.setInterval(() => {
      document.querySelectorAll(".prize-card").forEach((node) => node.classList.remove("active"));
      active = (active + 1) % prizes.length;
      document.querySelector(`[data-index="${active}"]`).classList.add("active");
      ticks += 1;
      if (ticks > 22) {
        window.clearInterval(timer);
        const picked = pick(prizes);
        bindStep("prize", picked)
          .then(() => {
            result = picked;
            save("lotteryPrize", result);
            document.querySelectorAll(".prize-card").forEach((node) => node.classList.remove("active"));
            document.querySelectorAll(".prize-card")[prizes.findIndex((item) => item.name === result.name)].classList.add("active");
            next.disabled = false;
          })
          .catch((error) => {
            showModal("无法保存摸金目标", error.message, "/index");
          });
      }
    }, 80);
  });

  next.addEventListener("click", () => {
    if (!result) return;
    window.location.href = "scene.html";
  });
}

function renderScenePage() {
  if (!localStorage.getItem("lotteryKey") || !load("lotteryPrize")) {
    window.location.href = "draw.html";
    return;
  }

  const grid = document.querySelector("[data-scenes]");
  const button = document.querySelector("[data-scene-draw]");
  const next = document.querySelector("[data-next]");
  let result = load("lotteryScene");

  grid.innerHTML = scenes.map((item) => `
    <div class="scene-card ${result && result.name === item.name ? "active" : ""}">
      <span class="scene-icon">${icon(item.icon)}</span>
      <p class="card-title">${item.name}</p>
      <p class="card-subtitle">${item.note}</p>
    </div>
  `).join("");
  button.disabled = Boolean(result);
  next.disabled = !result;

  button.addEventListener("click", async () => {
    if (result) return;
    button.disabled = true;
    next.disabled = true;
    try {
      await verifyCurrentKey();
    } catch (error) {
      showModal("密钥校验失败", error.message, "/index");
      return;
    }
    let ticks = 0;
    const timer = window.setInterval(() => {
      document.querySelectorAll(".scene-card").forEach((node) => node.classList.remove("active"));
      document.querySelectorAll(".scene-card")[ticks % scenes.length].classList.add("active");
      ticks += 1;
      if (ticks > 15) {
        window.clearInterval(timer);
        const picked = pick(scenes);
        bindStep("scene", picked)
          .then(() => {
            result = picked;
            save("lotteryScene", result);
            document.querySelectorAll(".scene-card").forEach((node) => node.classList.remove("active"));
            document.querySelectorAll(".scene-card")[scenes.findIndex((item) => item.name === result.name)].classList.add("active");
            next.disabled = false;
          })
          .catch((error) => {
            showModal("无法保存随机场景", error.message, "/index");
          });
      }
    }, 95);
  });

  next.addEventListener("click", () => {
    if (!result) return;
    window.location.href = "result.html";
  });
}

function renderResultPage() {
  const tool = load("lotteryTool");
  const prize = load("lotteryPrize");
  const scene = load("lotteryScene");
  const key = localStorage.getItem("lotteryKey");
  if (!key || !tool || !prize || !scene) {
    window.location.href = "/index";
    return;
  }

  const grid = document.querySelector("[data-result]");
  const rows = [
    { label: "选择道具", item: tool },
    { label: "抽中图标", item: prize },
    { label: "抽中场景", item: scene }
  ];

  grid.innerHTML = rows.map((row) => `
    <section class="result-card">
      <p class="result-label">${row.label}</p>
      <span class="result-icon">${icon(row.item.icon)}</span>
      <h2 class="card-title">${row.item.name}</h2>
      <p class="card-subtitle">${row.item.note}</p>
    </section>
  `).join("");

  const status = document.querySelector("[data-submit-status]");
  if (localStorage.getItem("lotterySubmitted") === "1") {
    status.textContent = "结果已提交，密钥已销毁。";
    return;
  }

  postJson("/api/key/consume", { key, result: { tool, prize, scene } })
    .then(() => {
      localStorage.setItem("lotterySubmitted", "1");
      status.textContent = "结果已提交，密钥已销毁。";
    })
    .catch((error) => {
      status.textContent = error.message;
    });
}

bindResetButtons();
bindImagePreview();

const page = document.body.dataset.page;
if (page === "tool") renderToolPage();
if (page === "draw") renderDrawPage();
if (page === "scene") renderScenePage();
if (page === "result") renderResultPage();
