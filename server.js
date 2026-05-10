const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const root = __dirname;
const dataDir = path.join(root, "data");
const storeFile = path.join(dataDir, "store.json");
const port = Number(process.env.PORT || 9873);
const adminUser = process.env.ADMIN_USER || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
const sessions = new Map();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(storeFile)) {
    fs.writeFileSync(storeFile, JSON.stringify({ keys: [], records: [] }, null, 2));
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(storeFile, "utf8"));
}

function writeStore(store) {
  ensureStore();
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2));
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function tokenFrom(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function requireAdmin(req, res) {
  const token = tokenFrom(req);
  if (!token || !sessions.has(token)) {
    sendJson(res, 401, { message: "请先登录后台" });
    return false;
  }
  return true;
}

function makeKey() {
  return crypto.randomBytes(4).toString("hex").toUpperCase() + "-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

function publicKey(item) {
  return {
    id: item.id,
    key: item.key,
    boss: item.boss,
    used: item.used,
    createdAt: item.createdAt,
    usedAt: item.usedAt || ""
  };
}

async function handleApi(req, res, pathname) {
  try {
    if (req.method === "POST" && pathname === "/api/admin/login") {
      const body = await readBody(req);
      if (body.username !== adminUser || body.password !== adminPassword) {
        sendJson(res, 401, { message: "账号或密码错误" });
        return;
      }
      const token = crypto.randomBytes(24).toString("hex");
      sessions.set(token, { createdAt: Date.now() });
      sendJson(res, 200, { token });
      return;
    }

    if (req.method === "POST" && pathname === "/api/admin/keys") {
      if (!requireAdmin(req, res)) return;
      const body = await readBody(req);
      const boss = String(body.boss || "").trim();
      if (!boss) {
        sendJson(res, 400, { message: "老板名称不能为空" });
        return;
      }
      const store = readStore();
      const normalizedBoss = boss.toLowerCase();
      const exists = store.keys.some((entry) => String(entry.boss || "").trim().toLowerCase() === normalizedBoss);
      if (exists) {
        sendJson(res, 409, { message: "老板名称已存在，不能重复生成密钥" });
        return;
      }
      const item = {
        id: crypto.randomUUID(),
        key: makeKey(),
        boss,
        used: false,
        createdAt: new Date().toISOString()
      };
      store.keys.unshift(item);
      writeStore(store);
      sendJson(res, 200, { key: publicKey(item) });
      return;
    }

    if (req.method === "GET" && pathname === "/api/admin/records") {
      if (!requireAdmin(req, res)) return;
      const store = readStore();
      sendJson(res, 200, {
        keys: store.keys.map(publicKey),
        records: store.records
      });
      return;
    }

    if (req.method === "POST" && pathname === "/api/key/verify") {
      const body = await readBody(req);
      const key = String(body.key || "").trim().toUpperCase();
      const store = readStore();
      const item = store.keys.find((entry) => entry.key === key);
      if (!item) {
        sendJson(res, 404, { message: "密钥不存在" });
        return;
      }
      if (item.used) {
        sendJson(res, 409, { message: "密钥已使用" });
        return;
      }
      sendJson(res, 200, { boss: item.boss, key: item.key });
      return;
    }

    if (req.method === "POST" && pathname === "/api/key/consume") {
      const body = await readBody(req);
      const key = String(body.key || "").trim().toUpperCase();
      const result = body.result || {};
      const store = readStore();
      const item = store.keys.find((entry) => entry.key === key);
      if (!item) {
        sendJson(res, 404, { message: "密钥不存在" });
        return;
      }
      if (item.used) {
        sendJson(res, 409, { message: "密钥已使用，不能重复提交结果" });
        return;
      }
      if (!result.tool || !result.prize || !result.scene) {
        sendJson(res, 400, { message: "抽奖结果不完整" });
        return;
      }
      const usedAt = new Date().toISOString();
      item.used = true;
      item.usedAt = usedAt;
      store.records.unshift({
        id: crypto.randomUUID(),
        key: item.key,
        boss: item.boss,
        result,
        usedAt,
        ip: req.socket.remoteAddress || ""
      });
      writeStore(store);
      sendJson(res, 200, { message: "结果已记录", boss: item.boss });
      return;
    }

    sendJson(res, 404, { message: "接口不存在" });
  } catch (error) {
    sendJson(res, 500, { message: "服务异常", detail: error.message });
  }
}

function serveStatic(req, res, pathname) {
  let cleanPath = pathname;
  if (pathname === "/" || pathname === "/index") cleanPath = "/index.html";
  if (pathname === "/admin") cleanPath = "/admin.html";
  const filePath = path.normalize(path.join(root, cleanPath));
  if (!filePath.startsWith(root)) {
    sendText(res, 403, "Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendText(res, 404, "Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url.pathname);
    return;
  }
  serveStatic(req, res, decodeURIComponent(url.pathname));
});

ensureStore();
server.listen(port, "0.0.0.0", () => {
  console.log(`choujiang server listening on http://0.0.0.0:${port}`);
});
