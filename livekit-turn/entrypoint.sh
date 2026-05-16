#!/usr/bin/env sh
set -eu

require_env() {
  eval "value=\${$1:-}"

  if [ -z "$value" ]; then
    echo "ERROR: $1 is not set"
    exit 1
  fi
}

require_numeric_env() {
  require_env "$1"
  eval "value=\${$1}"

  case "$value" in
    *[!0-9]*)
      echo "ERROR: $1 must be numeric"
      exit 1
      ;;
  esac
}

require_port_env() {
  require_numeric_env "$1"
  eval "value=\${$1}"

  if [ "$value" -lt 1 ] || [ "$value" -gt 65535 ]; then
    echo "ERROR: $1 must be between 1 and 65535"
    exit 1
  fi
}

require_port_env PORT
require_env TURN_REALM
require_env LIVEKIT_TURN_SECRET

cat > /tmp/turnserver.conf <<EOF
listening-port=${PORT}
realm=${TURN_REALM}
fingerprint
lt-cred-mech
use-auth-secret
static-auth-secret=${LIVEKIT_TURN_SECRET}
no-udp
no-dtls
no-tls
no-cli
no-multicast-peers
mobility
EOF

echo "Starting coturn"
echo "  TURN/TCP port: ${PORT}"
echo "  realm: ${TURN_REALM}"

exec turnserver -c /tmp/turnserver.conf
