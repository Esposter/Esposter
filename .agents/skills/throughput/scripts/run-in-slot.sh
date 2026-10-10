#!/usr/bin/env bash
# Runs one heavy command (a typecheck, a build, a test run) in one of a few machine-wide slots, so many agents never
# stack their 2 GB builds at once. Usage: bash .agents/skills/throughput/scripts/run-in-slot.sh <command> [args...]
# A slot is a directory, taken by an atomic mkdir; one whose holder died, or that never got its holder within a minute,
# is freed, so a killed agent never wedges it.
# There are half as many slots as the machine has physical performance cores, from one to four (two on an M1's four
# performance cores, four on the PC), unless RUN_SLOT_COUNT names a count.
# A slot is only taken while free memory is above the gate, an eighth of the machine's RAM, so the slot count can sit
# above what memory allows on a bad minute: the count keeps the cores fed and the gate keeps the machine off swap.
# The gate reads memory as it stands, so runs admitted together would all pass it on the same free gigabytes and then
# grow past it as one; a run is admitted only once the last one admitted has run a minute, long enough for a package
# build to reach its peak, or has ended, and the check, the take and every free happen under one lock, so two runners
# never free the same slot and one never frees a slot just retaken. A stale lock is freed under a guard of its own, read
# again inside it, so two waiting runners never both free it and one never frees the live lock a third has taken in
# between.
# On macOS the command runs under the utility QoS clamp, which its children inherit, so the scheduler keeps it behind
# the user's foreground apps
systemName="$(uname -s)"
slotDirectory="${TEMP:-/tmp}/esposter-run-slots"
rampSeconds="${RUN_SLOT_RAMP_SECONDS:-60}"
admitLockPath="$slotDirectory/admit.lock"
admittedPath="$slotDirectory/admitted"
reclaimLockPath="$slotDirectory/reclaim.lock"
# A waiting run polls after 2 s, doubling to every 10 s: each poll spawns about ten processes, and a slot frees on the
# scale of minutes
pollSeconds=2
maxPollSeconds=10
mkdir -p "$slotDirectory"

# The machine's physical performance cores: macOS's performance cluster (every physical core on a Mac with one kind),
# Windows's logical processors halved for SMT, and Linux's distinct cores, or its online processors halved
readPerformanceCoreCount() {
  case "$systemName" in
    Darwin) sysctl -n hw.perflevel0.physicalcpu 2>/dev/null || sysctl -n hw.physicalcpu ;;
    MINGW* | MSYS* | CYGWIN*) echo $((${NUMBER_OF_PROCESSORS:-2} / 2)) ;;
    *)
      coreCount="$(awk -F': *' '/^physical id/ { socket = $2 } /^core id/ { cores[socket ":" $2] = 1 }
        END { count = 0; for (core in cores) count++; print count }' /proc/cpuinfo 2>/dev/null)"
      if [ "${coreCount:-0}" -gt 0 ] 2>/dev/null; then echo "$coreCount"; else echo $(($(getconf _NPROCESSORS_ONLN) / 2)); fi
      ;;
  esac
}

if [ -n "${RUN_SLOT_COUNT:-}" ]; then
  slotCount="$RUN_SLOT_COUNT"
else
  performanceCoreCount="$(readPerformanceCoreCount)"
  slotCount=$((${performanceCoreCount:-2} / 2))
  if [ "$slotCount" -lt 1 ]; then slotCount=1; elif [ "$slotCount" -gt 4 ]; then slotCount=4; fi
fi

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

# The last admitted run, "<epoch seconds> <pid>", has reached its peak or ended
checkIsRamped() {
  [ -r "$admittedPath" ] || return 0
  read -r admittedAt admittedPid < "$admittedPath"
  [ "$(($(date +%s) - admittedAt))" -ge "$rampSeconds" ] || ! kill -0 "$admittedPid" 2>/dev/null
}

# A lock whose holder died, or one older than a minute when admission takes milliseconds, is freed, read and freed under
# The guard alone. A guard left by a runner killed inside it is freed a minute on, since a reclaim takes milliseconds
freeStaleAdmitLock() {
  if ! mkdir "$reclaimLockPath" 2>/dev/null; then
    [ -n "$(find "$reclaimLockPath" -maxdepth 0 -mmin +1 2>/dev/null)" ] && rm -rf "$reclaimLockPath"
    return
  fi
  holder=""
  { read -r holder < "$admitLockPath/pid"; } 2>/dev/null
  if { [ -n "$holder" ] && ! kill -0 "$holder" 2>/dev/null; } ||
    [ -n "$(find "$admitLockPath" -maxdepth 0 -mmin +1 2>/dev/null)" ]; then
    rm -rf "$admitLockPath"
  fi
  rm -rf "$reclaimLockPath"
}

while :; do
  if mkdir "$admitLockPath" 2>/dev/null; then
    echo "$$" > "$admitLockPath/pid"
    takenSlotPath=""
    if checkHasMemory && checkIsRamped; then
      for ((slot = 1; slot <= slotCount; slot++)); do
        slotPath="$slotDirectory/$slot"
        if mkdir "$slotPath" 2>/dev/null; then
          trap 'rm -rf "$slotPath"' EXIT INT TERM
          # Renamed into place, so a reader never sees half a pid. A slot whose holder was never written is freed a
          # Minute on, so the command never starts in one
          echo "$$" > "$slotPath/pid.$$" && mv "$slotPath/pid.$$" "$slotPath/pid" || exit 1
          echo "$(date +%s) $$" > "$admittedPath"
          takenSlotPath="$slotPath"
          break
        fi
        holder=""
        { read -r holder < "$slotPath/pid"; } 2>/dev/null
        if [ -n "$holder" ]; then
          kill -0 "$holder" 2>/dev/null || rm -rf "$slotPath"
        elif [ -n "$(find "$slotPath" -maxdepth 0 -mmin +1 2>/dev/null)" ]; then
          rm -rf "$slotPath"
        fi
      done
    fi
    rm -rf "$admitLockPath"
    if [ -n "$takenSlotPath" ]; then
      trap 'rm -rf "$takenSlotPath"' EXIT INT TERM
      # No one run takes more than a quarter of the machine's RAM: a node heap past it fails fast, as the app's
      # Whole-workspace typecheck does at 10-12 GB, rather than swapping every other run on the machine
      read -r _ total <<< "$(readMemory)"
      if [ -n "$total" ] && [[ "${NODE_OPTIONS:-}" != *max-old-space-size* ]]; then
        export NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=$((total / 4 / 1024))"
      fi
      if [ "$systemName" = Darwin ] && command -v taskpolicy >/dev/null 2>&1; then
        taskpolicy -c utility "$@"
      else
        "$@"
      fi
      exit $?
    fi
  else
    freeStaleAdmitLock
  fi
  sleep "$pollSeconds"
  pollSeconds=$((pollSeconds * 2 > maxPollSeconds ? maxPollSeconds : pollSeconds * 2))
done
