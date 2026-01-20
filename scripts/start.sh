#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/.logs"
RUN_DIR="$ROOT_DIR/.run"

mkdir -p "$LOG_DIR" "$RUN_DIR"
cd "$ROOT_DIR"

if [[ -d "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" ]]; then
  export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
elif command -v /usr/libexec/java_home >/dev/null 2>&1; then
  export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
fi

export PATH="$JAVA_HOME/bin:$PATH"

if lsof -ti :8080 >/dev/null 2>&1; then
  echo "Port 8080 is already in use. Stop the existing process and try again."
  exit 1
fi

if lsof -ti :5173 >/dev/null 2>&1; then
  echo "Port 5173 is already in use. Stop the existing process and try again."
  exit 1
fi

(
  cd "$ROOT_DIR/backend"
  mvn spring-boot:run
) >"$LOG_DIR/backend.log" 2>&1 &

echo $! > "$RUN_DIR/backend.pid"

python3 -m http.server 5173 --directory "$ROOT_DIR/frontend" \
  >"$LOG_DIR/frontend.log" 2>&1 &

echo $! > "$RUN_DIR/frontend.pid"

echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo "Logs:     $LOG_DIR"
