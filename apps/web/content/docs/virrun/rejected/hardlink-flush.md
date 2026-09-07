---
title: Hardlink/CAS flush
description: Speed up write-back by hardlinking or content-addressing the flush instead of byte-copying produced files.
---

# Hardlink/CAS flush

Speed up write-back by hardlinking (or content-addressing) the flush instead of byte-copying produced files from the sandbox upper to the host.

**Why not:** The flush crosses a filesystem boundary: the overlay upper lives on tmpfs and the host working dir is on disk. Hardlinks cannot span filesystems, so the apply step's copy is a full byte copy by necessity — there is no link to substitute. A CAS layer would not help either: write-back only flushes a command's _produced_ files (dist, tsbuildinfo, a migration), which are new bytes by definition, not dedupable against an existing store. The dep tree, which _is_ shared, already lives behind the CAS dep store and never flushes (it stays in the read-only snapshot lower).

Revisit only if the flush is ever measured as a material fraction of a write-back run's wall-clock (today persist sits within noise of the plain `os` build) **and** the upper and host are co-located on one filesystem so reflink/`copy_file_range` becomes available.
