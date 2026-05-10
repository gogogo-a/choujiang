#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-9873}"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$APP_DIR/logs"
PID_FILE="$APP_DIR/app.pid"

mkdir -p "$LOG_DIR"

echo "检查端口 $PORT 是否占用"
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -ti tcp:"$PORT" || true)"
elif command -v fuser >/dev/null 2>&1; then
  PIDS="$(fuser "$PORT"/tcp 2>/dev/null || true)"
else
  PIDS=""
fi

if [ -n "${PIDS:-}" ]; then
  echo "端口 $PORT 已占用，结束进程：$PIDS"
  kill -9 $PIDS || true
fi

if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE" || true)"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "结束旧服务进程：$OLD_PID"
    kill "$OLD_PID" || true
  fi
fi

echo "启动服务，端口：$PORT"
cd "$APP_DIR"
nohup env PORT="$PORT" ADMIN_USER="${ADMIN_USER:-admin}" ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123456}" node server.js > "$LOG_DIR/app.log" 2>&1 &
echo $! > "$PID_FILE"
sleep 1

if kill -0 "$(cat "$PID_FILE")" 2>/dev/null && curl -fsS "http://127.0.0.1:$PORT/index" >/dev/null 2>&1; then
  echo "用户端地址：http://服务器IP:$PORT/index"
  echo "管理端地址：http://服务器IP:$PORT/admin"
  echo "默认后台账号：admin"
  echo "默认后台密码：admin123456"
  echo "修改密码示例：ADMIN_PASSWORD='你的密码' ./start.sh"
else
  echo "启动失败，请查看日志：$LOG_DIR/app.log"
  exit 1
fi
