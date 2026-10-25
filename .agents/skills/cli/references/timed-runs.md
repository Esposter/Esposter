# Timed runs

Read when a command's run is timed, or its `.jsonl` history or slow-run warning is read or changed.

- **A timed run is recorded by the wrapper, never by the entry**: it appends to a per-command `.jsonl` in `TIMINGS_DIRECTORY` and warns on stderr when it is over `SLOW_RUN_FACTOR` times its own median. A plain script with no citty calls `timeCommand(<name>)` at its top.
