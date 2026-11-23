# Draining

Read when an ordinary change touches a file in a unit a question still holds open.

A ledger that only moves when someone sits down to work it moves at the rate someone sits down to work it, which is rarely. It does not have to: ordinary changes already land inside unswept units every day, and that contact is free coverage nobody is collecting.

**A change that edits a file inside an unswept unit sweeps that file first.** The sweep pass goes in its own commit, ahead of the behaviour change, and the behaviour change lands on the swept file. Not folded together — a pass loses its whole value as a revertible unit the moment a behaviour change rides inside it, and the reviewer loses the ability to read either one.

Scope it to the files the change touches, not the unit around them; widening it there is how a one-line fix turns into an afternoon.

A file the change creates has nothing to sweep: it is written to the current rules and read by the review, so only the files the change edits that already existed owe the pass.

While a question is sampled rather than read unit by unit, its open cells are not a backlog the pass drains: they are the pool the next sample draws from, and a cell a change touched is drawn by `pnpm ai:sweep:sample --touched <range>` and read whole in the next sitting. So the pass is owed only for a question whose ledger is read unit by unit.

**The cell stays `—` until the whole unit is swept.** There is no partially-swept state, and inventing one — a fraction, a file list, a third symbol — puts progress state at file granularity in a table that exists to track units, where it drifts the moment anyone touches those files again. The opportunistic pass shortens the eventual unit pass; it never reports it.

This is what keeps a standing ledger moving. The scheduled pass stops being the only thing that drains it and becomes the sweep-up for whatever ordinary work never happened to reach.
