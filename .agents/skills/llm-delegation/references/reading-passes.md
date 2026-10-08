# Reading Passes

Read when a task reads a whole tree to change part of it, and delegating it looks tempting because it is tedious.

A spec execution reads a handful of files and writes most of them. A convention sweep reads a whole tree to change a tenth of it, and its reader pays for every file it opens and discards. Cost tracks files **read**; value tracks files **changed**, and on a sweep the two differ by an order of magnitude.

That ratio is what the reader's family multiplies. On the main session's family, a delegated reader costs a large multiple of doing the pass in place: the tree is read again by a cold context, the rule is re-learned, and the report is read a second time. On `haiku`, every one of those reads costs a fraction of the same read in the main session, and the main context takes only the diff.

So the pass is split by **who decides each edit**, not by how tedious it is:

- **A find recipe or a pattern decides it** — the sweeps skill's recipe proven able to fail, an exact rename map, a mechanical rewrite whose every site a grep finds: a `haiku` agent per leaf runs it, and the main session reads the diff.
- **Reading decides it** — a claim checked against the code, prose held against a rule, a carve-out the rule never stated: the pass stays in the main session, one unit at a time. A cheaper reader that misses a carve-out ships the miss into every unit after it, where the main session finds it once and applies it to the rest.

Three costs compound when the work looks parallel, whichever family runs it:

- **Cold start per agent.** Each one re-reads the same skill files and conventions; fan-out multiplies that fixed cost by the number of agents. A haiku batch keeps the prompt carrying the rule, so the agent loads no skill it does not need.
- **No shared learning.** A carve-out one agent discovers is re-derived by every sibling, or missed. The prompt's report-back names every site the recipe matched but the agent left alone, so the main session sees the carve-out once.
- **A budget exhausted mid-unit** leaves a tree that cannot be ticked: one agent per leaf, each leaf small enough to finish.
