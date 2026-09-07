#!/usr/bin/env bash
# https://github.com/yuting1214/LiveKit-Template/blob/main/livekit-server/entrypoint.sh
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
require_env LIVEKIT_APP_WEBHOOK_URL
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

# A URL carries its credentials percent-encoded, so a generated password containing @ : / % reaches us as
# Escapes and has to be handed to Redis as what it actually is. Literal backslashes are doubled first, or %b
# Would interpret one that was already in the password
url_decode() {
  local value="${1//\\/\\\\}"
  printf '%b' "${value//%/\\x}"
}

# rediss:// is the whole difference between an encrypted connection and a cleartext one, so it is read before the
# Scheme is stripped rather than being lost with it. Matched case-insensitively, because a scheme is: `REDISS://`
# Compared literally is no scheme anyone knows, which leaves TLS off and the scheme in front of the credentials.
# An unknown scheme is rejected rather than defaulted — both ways of guessing at it connect. A url carrying no
# `://` leaves this empty, so it is refused by the same branch rather than by a check of its own
REDIS_SCHEME=""

if [[ "$REDIS_URL" == *"://"* ]]; then
  REDIS_SCHEME="$(printf "%s" "${REDIS_URL%%://*}" | tr "[:upper:]" "[:lower:]")"
fi

case "$REDIS_SCHEME" in
  redis) REDIS_USE_TLS=false ;;
  rediss) REDIS_USE_TLS=true ;;
  *)
    echo "ERROR: REDIS_URL must use the redis:// or rediss:// scheme"
    exit 1
    ;;
esac

REDIS_NO_SCHEME="${REDIS_URL#*://}"
REDIS_NO_QUERY="${REDIS_NO_SCHEME%%\?*}"
REDIS_USERNAME=""
REDIS_PASSWORD=""

if [[ "$REDIS_NO_QUERY" == *"@"* ]]; then
  # The *last* @ separates credentials from host, so a password holding one survives the split
  REDIS_AUTH="${REDIS_NO_QUERY%@*}"
  REDIS_HOST_PORT_DB="${REDIS_NO_QUERY##*@}"

  if [[ "$REDIS_AUTH" == *":"* ]]; then
    REDIS_USERNAME="$(url_decode "${REDIS_AUTH%%:*}")"
    REDIS_PASSWORD="$(url_decode "${REDIS_AUTH#*:}")"
  else
    # Userinfo is `username[:password]`, so the half on its own is the username. Read as the password it drops
    # The name the server authenticates against and offers the name as the secret, which fails ACL auth twice over
    REDIS_USERNAME="$(url_decode "$REDIS_AUTH")"
  fi
else
  REDIS_HOST_PORT_DB="$REDIS_NO_QUERY"
fi

# The path segment is the database number, and dropping it silently points LiveKit at db 0
REDIS_HOST_PORT="${REDIS_HOST_PORT_DB%%/*}"
REDIS_DB=""

if [[ "$REDIS_HOST_PORT_DB" == */* ]]; then
  REDIS_DB="${REDIS_HOST_PORT_DB#*/}"
fi

if [ -z "$REDIS_HOST_PORT" ]; then
  echo "ERROR: Could not parse REDIS_URL"
  exit 1
fi

if [ -n "$REDIS_DB" ] && ! [[ "$REDIS_DB" =~ ^[0-9]+$ ]]; then
  echo "ERROR: REDIS_URL database must be a number"
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
  echo "Starting HAProxy TCP forwarder: 0.0.0.0:${TCP_APP_PORT} -> 127.0.0.1:${ICE_TCP_PORT}"
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

cat > /etc/livekit.yaml <<EOF
port: ${PORT}
bind_addresses:
  - "0.0.0.0"

logging:
  level: '$(yaml_escape "${LIVEKIT_LOG_LEVEL}")'

rtc:
  tcp_port: ${ICE_TCP_PORT}
  port_range_start: 0
  port_range_end: 0
EOF

# Each of these is omitted rather than written empty: LiveKit reads an absent key as its own default, where a
# Blank username or a db of "" is a value it has to reject
REDIS_OPTIONS=""

if [ -n "$REDIS_USERNAME" ]; then
  REDIS_OPTIONS="${REDIS_OPTIONS}
  username: '$(yaml_escape "${REDIS_USERNAME}")'"
fi

if [ -n "$REDIS_DB" ]; then
  REDIS_OPTIONS="${REDIS_OPTIONS}
  db: ${REDIS_DB}"
fi

if [ "$REDIS_USE_TLS" = true ]; then
  REDIS_OPTIONS="${REDIS_OPTIONS}
  use_tls: true"
fi

cat >> /etc/livekit.yaml <<EOF

redis:
  address: '$(yaml_escape "${REDIS_HOST_PORT}")'
  password: '$(yaml_escape "${REDIS_PASSWORD}")'${REDIS_OPTIONS}

keys:
  '$(yaml_escape "${LIVEKIT_API_KEY}")': '$(yaml_escape "${LIVEKIT_API_SECRET}")'
EOF

cat >> /etc/livekit.yaml <<EOF

webhook:
  api_key: '$(yaml_escape "${LIVEKIT_API_KEY}")'
  urls:
    - '$(yaml_escape "${LIVEKIT_APP_WEBHOOK_URL}")'
    - '$(yaml_escape "${LIVEKIT_MONITOR_WEBHOOK_URL}")'
EOF

echo "Starting LiveKit"
echo "  signaling port: ${PORT}"
echo "  ICE TCP port: ${ICE_TCP_PORT}"
echo "  TCP proxy: ${TCP_PROXY_DOMAIN}:${TCP_PROXY_PORT} -> container:${TCP_APP_PORT}"
echo "  node IP: ${RESOLVED_PROXY_IP}"
echo "  app webhook: ${LIVEKIT_APP_WEBHOOK_URL}"
echo "  monitor webhook: ${LIVEKIT_MONITOR_WEBHOOK_URL}"

exec livekit-server --config /etc/livekit.yaml --node-ip "${RESOLVED_PROXY_IP}"
