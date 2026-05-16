#!/usr/bin/env bash
set -euo pipefail

require_env() {
  if [ -z "${!1:-}" ]; then
    echo "ERROR: $1 is not set"
    exit 1
  fi
}

require_env REDIS_URL
require_env LIVEKIT_API_KEY
require_env LIVEKIT_API_SECRET
require_env LIVEKIT_LOG_LEVEL
require_env LIVEKIT_MONITOR_WEBHOOK_URL
require_env RAILWAY_TCP_PROXY_DOMAIN

require_numeric_env() {
  require_env "$1"

  if [[ "${!1}" == *[!0-9]* ]]; then
    echo "ERROR: $1 must be numeric"
    exit 1
  fi
}

require_port_env() {
  require_numeric_env "$1"
  local v="${!1}"
  if [ "$v" -lt 1 ] || [ "$v" -gt 65535 ]; then
    echo "ERROR: $1 must be between 1 and 65535"
    exit 1
  fi
}

require_port_env PORT
require_port_env RAILWAY_TCP_PROXY_PORT
require_port_env RAILWAY_TCP_APPLICATION_PORT

if [ "$PORT" = "$RAILWAY_TCP_PROXY_PORT" ] || [ "$PORT" = "$RAILWAY_TCP_APPLICATION_PORT" ]; then
  echo "ERROR: PORT must be distinct from Railway TCP proxy ports"
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

TCP_PROXY_DOMAIN="$RAILWAY_TCP_PROXY_DOMAIN"
TCP_PROXY_PORT="$RAILWAY_TCP_PROXY_PORT"
TCP_APP_PORT="$RAILWAY_TCP_APPLICATION_PORT"
ICE_TCP_PORT="$TCP_PROXY_PORT"

echo "TCP proxy: ${TCP_PROXY_DOMAIN}:${TCP_PROXY_PORT} -> container:${TCP_APP_PORT}"

RESOLVED_PROXY_IP="$(getent ahostsv4 "$TCP_PROXY_DOMAIN" 2>/dev/null | awk 'NR==1 {print $1}' || true)"

if [ -z "$RESOLVED_PROXY_IP" ]; then
  RESOLVED_PROXY_IP="$(getent hosts "$TCP_PROXY_DOMAIN" 2>/dev/null | awk 'NR==1 {print $1}' || true)"
fi

if [ -z "$RESOLVED_PROXY_IP" ]; then
  echo "ERROR: Could not resolve ${TCP_PROXY_DOMAIN}"
  exit 1
fi

echo "Resolved TCP proxy IP: ${RESOLVED_PROXY_IP}"

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
  timeout client 1h
  timeout server 1h
  log global
  option tcplog

listen ice_forwarder
  bind 0.0.0.0:${TCP_APP_PORT}
  server livekit 127.0.0.1:${ICE_TCP_PORT}
EOF

    haproxy -f /tmp/haproxy.cfg -D
  fi
fi

cat > /etc/livekit.yaml <<EOF
port: ${PORT}
bind_addresses:
  - "0.0.0.0"

logging:
  level: '$(yaml_escape "${LIVEKIT_LOG_LEVEL}")'

rtc:
  tcp_port: ${ICE_TCP_PORT}
  node_ip: '$(yaml_escape "${RESOLVED_PROXY_IP}")'

redis:
  address: '$(yaml_escape "${REDIS_HOST_PORT}")'
  password: '$(yaml_escape "${REDIS_PASSWORD}")'

keys:
  '$(yaml_escape "${LIVEKIT_API_KEY}")': '$(yaml_escape "${LIVEKIT_API_SECRET}")'
EOF

cat >> /etc/livekit.yaml <<EOF

webhook:
  api_key: '$(yaml_escape "${LIVEKIT_API_KEY}")'
  urls:
    - '$(yaml_escape "${LIVEKIT_MONITOR_WEBHOOK_URL}")'
EOF

echo "Starting LiveKit"
echo "  signaling port: ${PORT}"
echo "  ICE TCP port: ${ICE_TCP_PORT}"
echo "  TCP proxy: ${TCP_PROXY_DOMAIN}:${TCP_PROXY_PORT} -> container:${TCP_APP_PORT}"
echo "  advertised node IP: ${RESOLVED_PROXY_IP}"

exec livekit-server --config /etc/livekit.yaml
