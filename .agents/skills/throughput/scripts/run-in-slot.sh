#!/usr/bin/env bash
# Runs one heavy command (a typecheck, a build, a test run) in one of a few machine-wide slots, so many agents never
# Stack their 2 GB builds at once. Usage: bash .agents/skills/throughput/scripts/run-in-slot.sh <command> [args...]
# A slot is a directory, taken by an atomic mkdir; one whose holder died, or that never got its holder within a minute,
# Is freed, so a killed agent never wedges it. A slot is only taken while free memory is above the gate, an eighth of
# The machine's RAM, so the slot count can sit above what memory allows on a bad minute: the count keeps the cores fed
# And the gate keeps the machine off swap
slotCount="${RUN_SLOT_COUNT:-4}"
slotDirectory="${TEMP:-/tmp}/esposter-run-slots"
mkdir -p "$slotDirectory"

# Prints "free total" in kilobytes: /proc/meminfo on Linux and in Git Bash, the kernel's pressure level on macOS
readMemory() {
  if [ -r /proc/meminfo ]; then
    awk '/^MemTotal:/ { total = $2 } /^MemAvailable:/ { available = $2 } /^MemFree:/ { free = $2 }
      END { print (available ? available : free), total }' /proc/meminfo
  elif command -v sysctl >/dev/null 2>&1; then
    total=$(($(sysctl -n hw.memsize) / 1024))
    echo "$((total * $(sysctl -n kern.memorystatus_level) / 100)) $total"
  fi
}

checkHasMemory() {
  read -r free total <<< "$(readMemory)"
  [ -z "$total" ] || [ "$free" -gt "$((total / 8))" ]
}

while :; do
  if checkHasMemory; then
    for slot in $(seq 1 "$slotCount"); do
      slotPath="$slotDirectory/$slot"
      if mkdir "$slotPath" 2>/dev/null; then
        trap 'rm -rf "$slotPath"' EXIT INT TERM
        # Renamed into place, so a reader never sees half a pid. A slot whose holder was never written is freed a minute
        # On, so the command never starts in one
        echo "$$" > "$slotPath/pid.$$" && mv "$slotPath/pid.$$" "$slotPath/pid" || exit 1
        # No one run takes more than a quarter of the machine's RAM: a node heap past it fails fast, as the app's
        # Whole-workspace typecheck does at 10-12 GB, rather than swapping every other run on the machine
        read -r _ total <<< "$(readMemory)"
        if [ -n "$total" ] && [[ "${NODE_OPTIONS:-}" != *max-old-space-size* ]]; then
          export NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=$((total / 4 / 1024))"
        fi
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
  fi
  sleep 2
done
