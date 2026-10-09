#!/usr/bin/env bash
# Runs one heavy command (a typecheck, a build, a test run) in one of a few machine-wide slots, so many agents never
# Stack their 2 GB builds at once. Usage: bash .agents/skills/throughput/scripts/run-in-slot.sh <command> [args...]
# A slot is a directory, taken by an atomic mkdir; one whose holder died, or that never got its holder within a minute,
# Is freed, so a killed agent never wedges it
slotCount="${RUN_SLOT_COUNT:-2}"
slotDirectory="${TEMP:-/tmp}/esposter-run-slots"
mkdir -p "$slotDirectory"

while :; do
  for slot in $(seq 1 "$slotCount"); do
    slotPath="$slotDirectory/$slot"
    if mkdir "$slotPath" 2>/dev/null; then
      # Renamed into place, so a reader never sees half a pid
      echo "$$" > "$slotPath/pid.$$" && mv "$slotPath/pid.$$" "$slotPath/pid"
      trap 'rm -rf "$slotPath"' EXIT INT TERM
      "$@"
      exit $?
    fi
    # One runner at a time frees a slot, reading its holder under the lock, so a slot another runner freed and a third
    # Retook in between is never freed again. A lock older than a minute is a runner that died holding it
    reclaimPath="$slotPath.reclaim"
    find "$reclaimPath" -maxdepth 0 -mmin +1 -exec rmdir {} \; 2>/dev/null
    if mkdir "$reclaimPath" 2>/dev/null; then
      holder="$(cat "$slotPath/pid" 2>/dev/null)"
      if [ -n "$holder" ]; then
        kill -0 "$holder" 2>/dev/null || rm -rf "$slotPath"
      elif [ -n "$(find "$slotPath" -maxdepth 0 -mmin +1 2>/dev/null)" ]; then
        rm -rf "$slotPath"
      fi
      rmdir "$reclaimPath"
    fi
  done
  sleep 2
done
