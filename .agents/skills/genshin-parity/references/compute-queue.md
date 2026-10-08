# The Compute Queue

Read when a solve, fit, calibration, render, `compare` or any other long run is owed and no judgement is left in it, or when picking one up.

A build writes the script; the run waits in the queue. A queue item is work whose every call is already made, so it is a `haiku` agent's: the main session decides what is owed and what a result means, never waits on the run itself.

## An item

One line under the roadmap's **Compute queue** (`apps/web/content/docs/genshin/roadmap.md`), carrying everything a runner needs and nothing it must decide:

- the exact command, from the repo root, with every argument;
- what it reads, paths outside the repo named (`~/Esposter/genshin-parity/...`);
- what it writes;
- the measure that says it worked, with its bar.

An item missing any of the four is not queued: the gap is a call, and calls are the main session's.

## Running one

1. The shared checkout, on `ai/queue` (`llm-delegation`'s `references/running-agents.md`); the runner commits only what its command wrote.
2. An item that needs the parity page starts it in the background first, and only one such item runs at a time: an edit to world or engine source reloads the page and kills every run on it.
3. The run goes in the background; the runner reads its output when it ends, never a foreground wait.
4. The measure meets its bar: commit what the command wrote (data, a report row) and delete the item from the queue in the same commit — the roadmap holds open work only.
5. The measure misses: commit nothing, change no parameter, and report the number. A miss is a call for the main session, never a second run with a value guessed.

## How many at once

The main session sets it, by what the machine and the account can carry; a few long solves at once is the ceiling, and runs on the parity page are one at a time (step 2).
