#!/usr/bin/env bash
# Rebuild the site and (re)start the production server on port 3000.
# Build runs in the foreground so errors surface; the server is launched in a new
# session (setsid) so it keeps running after this script — and your shell — exits.
# Safe to re-run no matter who started the current server.
set -euo pipefail
cd "$(dirname "$0")"
# Group-writable so any team member can publish over another member's build.
umask 002
mkdir -p .run

# /home is a small 300M virtiofs volume; the Next.js build (node_modules + .next)
# lives on the root overlay via symlinks so the build fits. Recreate the links if
# a fresh clone dropped them or their target was wiped (e.g. an environment
# reset clears /var/tmp, leaving dead symlinks) — they must point at an
# overlay-backed directory that actually exists.
if [ ! -L node_modules ] || [ ! -d node_modules ]; then
  rm -rf node_modules
  mkdir -p /var/tmp/apex-site-store/node_modules
  ln -s /var/tmp/apex-site-store/node_modules node_modules
fi
if [ ! -L .next ] || [ ! -d .next ]; then
  rm -rf .next
  mkdir -p /var/tmp/apex-site-store/.next
  ln -s /var/tmp/apex-site-store/.next .next
fi

bun install
bun run build

# Free port 3000. NOTE: do NOT rely on `lsof` here — in this sandbox lsof is blind
# to detached (setsid) server sockets, so a publish would leave the old server
# running, the new one would crash with EADDRINUSE, and this script would falsely
# report success while the OLD page stays live. Instead:
#   1. Find the LISTEN socket's inode for 0.0.0.0:3000 in /proc/net/tcp.
#   2. Find every PID holding that inode (scan /proc/*/fd) and TERM it.
#   3. Wait for the socket to disappear; escalate to KILL if it lingers.
#   4. Bind-probe the port with a throwaway socket — success is definitive.
PORT=3000
HEX=$(printf '%04X' "$PORT")
LISTEN_RE="^[[:space:]]*[0-9]+: 00000000:${HEX} 00000000:0000 0A "

free_port() {
  # inode of the LISTEN socket for port $PORT in this network namespace
  local inode
  inode=$(awk -v la="00000000:$HEX" '$2 == la && $4 == "0A" { print $10; exit }' \
    /proc/net/tcp 2>/dev/null || true)
  if [ -n "$inode" ]; then
    local fd target pid
    for fd in /proc/[0-9]*/fd/*; do
      [ -r "$fd" ] || continue
      target=$(readlink "$fd" 2>/dev/null || true)
      if [ "$target" = "socket:[$inode]" ]; then
        pid=${fd#/proc/}; pid=${pid%%/*}
        kill "$pid" 2>/dev/null || true
      fi
    done
    # Graceful-shutdown window (Next.js can take a moment to release the port).
    for _ in $(seq 1 15); do
      grep -qE "$LISTEN_RE" /proc/net/tcp 2>/dev/null || break
      sleep 1
    done
  fi
  # Escalate: Next.js forks workers that may hold the listen socket; kill any
  # remaining site server process by name, then force-kill socket holders.
  pkill -9 -f "next start" 2>/dev/null || true
  pkill -9 -f "next-server" 2>/dev/null || true
  if grep -qE "$LISTEN_RE" /proc/net/tcp 2>/dev/null; then
    local inode2
    inode2=$(awk -v la="00000000:$HEX" '$2 == la && $4 == "0A" { print $10; exit }' \
      /proc/net/tcp 2>/dev/null || true)
    if [ -n "$inode2" ]; then
      for fd in /proc/[0-9]*/fd/*; do
        [ -r "$fd" ] || continue
        target=$(readlink "$fd" 2>/dev/null || true)
        if [ "$target" = "socket:[$inode2]" ]; then
          pid=${fd#/proc/}; pid=${pid%%/*}
          kill -9 "$pid" 2>/dev/null || true
        fi
      done
    fi
  fi
  # Definitive check: actually bind the port, retrying while a dying server
  # finishes releasing it. Busy after all retries => fail loudly.
  for _ in $(seq 1 10); do
    if python3 - "$PORT" <<'EOF' >/dev/null 2>&1; then
import socket, sys
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    # SO_REUSEADDR: without it, TIME_WAIT sockets left by recent connections to
    # the port (e.g. this script's own curl checks) make bind() fail with
    # EADDRINUSE for ~60s even though no listener is alive. Node sets this on
    # its own sockets, so the probe must match that behaviour.
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(("0.0.0.0", int(sys.argv[1])))
except OSError:
    sys.exit(1)
finally:
    s.close()
EOF
      return 0
    fi
    sleep 1
  done
  echo "error: port $PORT is still in use and could not be freed" >&2
  exit 1
}

free_port

setsid nohup node ./node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port 3000 > .run/server.log 2>&1 < /dev/null &

# Wait for the new server to actually answer before reporting success, so a
# startup crash surfaces here instead of silently leaving the old page live.
for _ in $(seq 1 60); do
  if curl -sf -o /dev/null http://localhost:3000; then
    echo "site published; serving on port 3000"
    exit 0
  fi
  sleep 0.5
done
echo "warning: published, but the server isn't responding — .run/server.log:" >&2
tail -20 .run/server.log >&2 || true
exit 1
