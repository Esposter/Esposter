#!/bin/sh
set -eu

require_env() {
  eval "value=\${$1:-}"

  if [ -z "$value" ]; then
    echo "ERROR: $1 is not set"
    exit 1
  fi
}

require_env LIVEKIT_URL
require_env LIVEKIT_API_KEY
require_env LIVEKIT_API_SECRET
require_env PORT
require_env SQLITE_PATH

exec "$@"
