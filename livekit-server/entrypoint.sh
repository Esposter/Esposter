#!/usr/bin/env bash
set -euo pipefail

if [ -z "${REDIS_URL:-}" ]; then
  echo "ERROR: REDIS_URL is not set"
  exit 1
fi

if [ -z "${LIVEKIT_API_KEY:-}" ]; then
  echo "ERROR: LIVEKIT_API_KEY is not set"
  exit 1
fi

if [ -z "${LIVEKIT_API_SECRET:-}" ]; then
  echo "ERROR: LIVEKIT_API_SECRET is not set"
  exit 1
fi

yaml_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

REDIS_NO_SCHEME="${REDIS_URL#redis://}"
REDIS_NO_SCHEME="${REDIS_NO_SCHEME#rediss://}"
REDIS_NO_QUERY="${REDIS_NO_SCHEME%%\?*}"
REDIS_PASSWORD=""

if [[ "$REDIS_NO_QUERY" == *"@"* ]]; then
  REDIS_AUTH="${REDIS_NO_QUERY%@*}"
  REDIS_HOST_PORT="${REDIS_NO_QUERY#*@}"

  if [[ "$REDIS_AUTH" == *":"* ]]; then
    REDIS_PASSWORD="${REDIS_AUTH#*:}"
  else
    REDIS_PASSWORD="$REDIS_AUTH"
  fi
else
  REDIS_HOST_PORT="$REDIS_NO_QUERY"
fi

REDIS_HOST_PORT="${REDIS_HOST_PORT%%/*}"

if [ -z "$REDIS_HOST_PORT" ]; then
  echo "ERROR: Could not parse REDIS_URL"
  exit 1
fi

TCP_PROXY_DOMAIN="${RAILWAY_TCP_PROXY_DOMAIN:-}"
TCP_PROXY_PORT="${RAILWAY_TCP_PROXY_PORT:-}"
TCP_APP_PORT="${RAILWAY_TCP_APPLICATION_PORT:-}"
NODE_IP=""
ICE_TCP_PORT="7881"
USE_EXTERNAL_IP="true"
NODE_IP_MODE="${LIVEKIT_NODE_IP_MODE:-proxy}"

if [ -n "$TCP_PROXY_DOMAIN" ] && [ -n "$TCP_PROXY_PORT" ] && [ -n "$TCP_APP_PORT" ]; then
  echo "TCP proxy: ${TCP_PROXY_DOMAIN}:${TCP_PROXY_PORT} -> container:${TCP_APP_PORT}"

  if [ "$NODE_IP_MODE" = "auto" ]; then
    USE_EXTERNAL_IP="true"
  else
    USE_EXTERNAL_IP="false"
    NODE_IP="$(getent ahostsv4 "$TCP_PROXY_DOMAIN" 2>/dev/null | awk 'NR==1 {print $1}' || true)"

    if [ -z "$NODE_IP" ]; then
      NODE_IP="$(getent hosts "$TCP_PROXY_DOMAIN" 2>/dev/null | awk 'NR==1 {print $1}' || true)"
    fi

    if [ -z "$NODE_IP" ]; then
      echo "WARNING: Could not resolve ${TCP_PROXY_DOMAIN}; falling back to automatic external IP discovery"
      USE_EXTERNAL_IP="true"
    fi
  fi

  ICE_TCP_PORT="$TCP_PROXY_PORT"

  if [ "$TCP_APP_PORT" != "$ICE_TCP_PORT" ]; then
    echo "Forwarding TCP application port ${TCP_APP_PORT} to LiveKit ICE port ${ICE_TCP_PORT}"

    if iptables -t nat -A PREROUTING -p tcp --dport "${TCP_APP_PORT}" -j REDIRECT --to-port "${ICE_TCP_PORT}" 2>/dev/null; then
      echo "iptables redirect configured"
    else
      echo "iptables redirect unavailable; starting haproxy TCP forwarder"

      cat > /tmp/haproxy.cfg <<EOF
global
  log stdout format raw local0 info

defaults
  mode tcp
  timeout connect 5s
  timeout client 300s
  timeout server 300s
  log global
  option tcplog

listen ice_forwarder
  bind 0.0.0.0:${TCP_APP_PORT}
  server livekit 127.0.0.1:${ICE_TCP_PORT}
EOF

      haproxy -f /tmp/haproxy.cfg -D
    fi
  fi
else
  echo "No Railway TCP proxy variables found; using LiveKit default ICE TCP port ${ICE_TCP_PORT}"
fi

SIGNAL_PORT="${PORT:-8080}"
LOG_LEVEL="${LIVEKIT_LOG_LEVEL:-info}"
MONITOR_WEBHOOK_URL="${LIVEKIT_MONITOR_WEBHOOK_URL:-}"

cat > /etc/livekit.yaml <<EOF
port: ${SIGNAL_PORT}
bind_addresses:
  - "0.0.0.0"

logging:
  level: '$(yaml_escape "${LOG_LEVEL}")'

rtc:
  tcp_port: ${ICE_TCP_PORT}
  port_range_start: 0
  port_range_end: 0
  use_external_ip: ${USE_EXTERNAL_IP}
  force_tcp: false
  use_ice_lite: false
  enable_loopback_candidate: false

redis:
  address: '$(yaml_escape "${REDIS_HOST_PORT}")'
  password: '$(yaml_escape "${REDIS_PASSWORD}")'

keys:
  '$(yaml_escape "${LIVEKIT_API_KEY}")': '$(yaml_escape "${LIVEKIT_API_SECRET}")'

room:
  auto_create: true

turn:
  enabled: false
EOF

if [ -n "$MONITOR_WEBHOOK_URL" ]; then
  cat >> /etc/livekit.yaml <<EOF

webhook:
  api_key: '$(yaml_escape "${LIVEKIT_API_KEY}")'
  urls:
    - '$(yaml_escape "${MONITOR_WEBHOOK_URL}")'
EOF
fi

echo "Starting LiveKit"
echo "  signaling port: ${SIGNAL_PORT}"
echo "  ICE TCP port: ${ICE_TCP_PORT}"
echo "  TCP proxy: ${TCP_PROXY_DOMAIN:-none}:${TCP_PROXY_PORT:-none} -> container:${TCP_APP_PORT:-none}"

if [ -n "$NODE_IP" ]; then
  exec livekit-server --config /etc/livekit.yaml --node-ip "$NODE_IP"
fi

exec livekit-server --config /etc/livekit.yaml
