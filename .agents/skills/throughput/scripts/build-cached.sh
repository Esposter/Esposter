#!/usr/bin/env bash
# Brings a workspace package and every workspace package it links up to date through the content-addressed build cache.
# Usage: bash .agents/skills/throughput/scripts/build-cached.sh <package directory>, the same entry the dev server runs with node
# (scripts/src/buildCache/index.ts, which owns the rules: a hit restores, a miss builds and stores).
exec node --conditions=source "$(dirname "$0")/../../../../scripts/node_modules/tsx/dist/cli.mjs" "$(dirname "$0")/../../../../scripts/src/buildCache/index.ts" "$@"
