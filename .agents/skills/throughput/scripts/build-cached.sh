#!/usr/bin/env bash
# Builds one workspace package through the content-addressed build cache: a hit restores its dist, a miss builds it in a
# Slot and stores it under its key. Usage: bash .agents/skills/throughput/scripts/build-cached.sh <package directory>
set -euo pipefail
packageDirectory="$(cd "$1" && pwd)"
cd "$(dirname "$0")/../../../../scripts"
exec pnpm exec tsx src/buildCache/index.ts "$packageDirectory"
