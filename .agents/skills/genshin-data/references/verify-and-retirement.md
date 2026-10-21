# Verify and retirement

Read when a key or a dataset is retired, or `verify` and `prune` run.

The one-line rules are in `SKILL.md`; this page is their reasoning.

A key is retired by deleting its lock line, a dataset by removing its `GameDataset` member; `genshin:data prune` runs on demand and takes only what no live lock has named for 90 days.
