#!/usr/bin/env bash
# Keep-alive watchdog for the Apex Drive site on port 3000.
#
# The sandbox occasionally reaps detached `next start` processes (servers have
# been observed dying within a minute of a clean start, with no crash in the
# server log). This loop restarts the production server whenever port 3000
# stops answering, so the published site stays up.
#
# Start it detached once:
#   setsid nohup bash /home/team/shared/site/keepalive.sh > /tmp/apex-keepalive.log 2>&1 < /dev/null &
# Stop it: pkill -f keepalive.sh
#
# Uses the same start command as publish.sh. Only ever starts ONE server:
# if the port is already answering, it does nothing.

set -u
cd /home/team/shared/site
LOG=/tmp/apex-keepalive.log

log() { echo "$(date '+%H:%M:%S') $*" >> "$LOG"; }

port_up() {
  curl -sf -o /dev/null --max-time 4 http://localhost:3000/
}

# Wait until the port is genuinely free before starting (the previous server
# can take a moment to release the listen socket after being reaped).
port_free() {
  python3 - <<'EOF' >/dev/null 2>&1
import socket, sys
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.bind(("0.0.0.0", 3000))
    sys.exit(0)
except OSError:
    sys.exit(1)
finally:
    s.close()
EOF
}

log "keepalive started"

while true; do
  if port_up; then
    sleep 5
    continue
  fi

  # Port is down. Kill any half-dead next-server remnants, then wait for the
  # socket to be released, then start fresh.
  pkill -9 -f "next start --hostname 0.0.0.0 --port 3000" 2>/dev/null || true
  pkill -9 -f "next-server" 2>/dev/null || true

  for _ in $(seq 1 30); do
    port_free && break
    sleep 1
  done

  if port_up; then
    sleep 5
    continue
  fi

  if [ -f .next/BUILD_ID ]; then
    log "restarting server"
    setsid nohup node ./node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port 3000 >> .run/server.log 2>&1 < /dev/null &
  else
    log "no production build (.next/BUILD_ID missing) — cannot start"
    sleep 30
  fi

  # Give it up to 30s to come up; loop re-checks if not.
  for _ in $(seq 1 30); do
    port_up && log "server up" && break
    sleep 1
  done
  sleep 5
done
