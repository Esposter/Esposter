# Reading Passes

Read when a task reads a whole tree to change part of it, and delegating it looks tempting because it is tedious.

The division of labour in `SKILL.md` splits on judgment vs. execution. There is a second axis that overrides it: **how much of the
agent's context is spent reading versus writing.** A spec execution reads a handful of files and writes most of
them. A convention sweep reads a whole tree to change a tenth of it, and the agent pays full context cost for
every file it opens and discards.

That inverts the economics. Cost tracks files **read**, but value tracks files **changed**, and on a sweep those
differ by an order of magnitude — so the price of one delivered edit is roughly ten times the price of reading
one file, landing in the **tens of thousands of tokens per changed file**. That is a large multiple of doing the
same pass in the main session, where the tree is read once and the rule is already in context. Four parallel
sweep agents can burn a session's remaining budget and stop mid-unit, leaving partially-swept trees that cannot
be ticked.

So: **delegate by edit ratio, not by tedium.** Mechanical does not mean delegable. If the task is "read
everything under X and change what matches", run it in the main session and chunk it by unit. Delegate when the
files to change are known up front.

Three costs compound and are easy to miss when the work looks parallel:

- **Cold start per agent.** Each one re-reads the same skill files, references and conventions the main session
  already holds. Fan-out multiplies that fixed cost by the number of agents.
- **Reading dominates.** The change is a few lines; the judgment needs the whole file. Tokens track files read.
- **No shared learning.** A carve-out one agent discovers (an exception the rule failed to state) is re-derived
  by every sibling, or missed. In the main session it is found once and applied to everything after it.
