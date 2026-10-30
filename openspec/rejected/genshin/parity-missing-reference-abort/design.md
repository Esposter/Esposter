# Aborting a run on the first missing reference file

A run over every reference, `compare --all` or `verify`, would stop at the first reference whose committed file is not on disk, name that one and exit. The rest of the map would go unmeasured and unchecked.

**Why not:** the abort drops every other reference's result with it. `compare --all` writes its scores only once the run has visited every reference, so an abort at a missing file loses the scores of each reference measured before it and writes none, and `verify` never prints the summary line that counts how many references pass. The run names each missing file, measures or checks the others, writes the scores it has, and exits 1 at the end, so one absent file costs its own reference and nothing else (`openspec/specs/genshin/parity/references/spec.md`).
