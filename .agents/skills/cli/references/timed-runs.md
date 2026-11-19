# Timed runs

Read when a command's run is timed, or its `.jsonl` history or slow-run warning is read or changed.

- **A timed run is recorded by the wrapper, never by the entry**: it appends to a per-command `.jsonl` in `TIMINGS_DIRECTORY` and prints the run's time as one stderr line, `<name>: <seconds>s`, or the warning in its place when the run is over `SLOW_RUN_FACTOR` times its own median. No entry prints a time of its own. Every entry, one with no arguments included, is a citty command started by `runCommand`, so `--help` and the time come with it.
