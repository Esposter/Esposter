#!/usr/bin/env bash
# Runs one heavy command (a typecheck, a test run, a world render) in one of a few machine-wide slots, so many agents
# never stack their memory at once. Usage: bash .agents/skills/throughput/scripts/run-in-slot.sh <command> [args...]
# The gate itself is scripts/src/runInSlot (its slot logic is scripts/src/services/buildCache/runInSlot.ts), the one
# implementation the build cache also waits on. This wrapper only starts it with node, from the caller's directory, so
# the command runs where it was run and the exit status is the command's.
repositoryRoot="$(cd "$(dirname "$0")/../../../.." && pwd)"
exec node --conditions=source "$repositoryRoot/scripts/node_modules/tsx/dist/cli.mjs" \
  "$repositoryRoot/scripts/src/runInSlot/index.ts" -- "$@"
