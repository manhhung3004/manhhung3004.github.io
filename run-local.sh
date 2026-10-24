#!/usr/bin/env bash
# Chạy thử image production ở local trước khi deploy lên Render.
# Dùng: ./run-local.sh [start|rebuild|stop|logs]   (mặc định: start)
#   start   — build nếu chưa có image, rồi chạy
#   rebuild — build lại từ đầu (--no-cache --pull), rồi chạy
set -euo pipefail
cd "$(dirname "$0")"

IMAGE=huong-dan-ai-agent
NAME=huong-dan-ai-agent-local
PORT=${PORT:-8080}

docker info >/dev/null 2>&1 || {
  echo "Không kết nối được Docker. Nếu lỗi permission: sudo usermod -aG docker \$USER rồi mở lại terminal." >&2
  exit 1
}

run() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  docker run -d --name "$NAME" -p "$PORT:$PORT" -e PORT="$PORT" "$IMAGE" >/dev/null
  echo "Đang chạy: http://localhost:$PORT  (dừng: $0 stop, xem log: $0 logs)"
}

case "${1:-start}" in
  start)
    docker image inspect "$IMAGE" >/dev/null 2>&1 || docker build -t "$IMAGE" .
    run ;;
  rebuild)
    docker build --no-cache --pull -t "$IMAGE" .
    run ;;
  stop)
    docker rm -f "$NAME" ;;
  logs)
    docker logs -f "$NAME" ;;
  *)
    echo "Dùng: $0 [start|rebuild|stop|logs]" >&2
    exit 1 ;;
esac
