#!/usr/bin/env bash
# Runs one heavy command (a typecheck, a build, a test run) in one of a few machine-wide slots, so many agents never
# Stack their 2 GB builds at once. Usage: bash .agents/skills/throughput/scripts/run-in-slot.sh <command> [args...]
# A slot is a directory, taken by an atomic mkdir; one whose holder died is freed, so a killed agent never wedges it
slotCount="${RUN_SLOT_COUNT:-2}"
slotDirectory="${TEMP:-/tmp}/esposter-run-slots"
mkdir -p "$slotDirectory"

while :; do
  for slot in $(seq 1 "$slotCount"); do
    slotPath="$slotDirectory/$slot"
    if mkdir "$slotPath" 2>/dev/null; then
      echo "$$" > "$slotPath/pid"
      trap 'rm -rf "$slotPath"' EXIT INT TERM
      "$@"
      exit $?
    fi
    holder="$(cat "$slotPath/pid" 2>/dev/null)"
    if [ -n "$holder" ] && ! kill -0 "$holder" 2>/dev/null; then rm -rf "$slotPath"; fi
  done
  sleep 2
done
