# One Affordance per Action

Read when two controls seem to do the same thing, or a new control is added beside an existing one.

**Every action gets exactly one visible way to trigger it.** Two controls that do the identical thing are not "convenience" — they make the user stop and ask whether the two differ, and they double the surface that has to stay in sync.

When you find duplicates, keep the affordance with the **largest hit target and the least chrome**, and delete the rest — in a table row that is the row click itself, so a name-cell link and an "Open" button pointing at the same route both go, leaving the actions slot holding only what the row click can't do.

- **Don't style non-links like links.** `text-info` + underline is a promise of a distinct navigation target. If the row already navigates, the name is plain text — styling it as a link implies it goes somewhere else.
- **A different trigger for the same command is not a duplicate.** A right-click context menu and a row `⋮` menu are two triggers for one list of commands — that is fine, and they must be driven by **one** shared `Item[]` (`references/action-items.md`). What is banned is a second _visible_ control for a command that already has one.
- **A genuinely different behaviour is not a duplicate.** `Open in new tab` survives next to row-click because it does something row-click cannot.
- **A status banner's own stop control is not a duplicate either.** Where a transient state announces itself in a banner ("X is presenting", "recording"), the banner carries the control that ends it, even though the toolbar already has a toggle for the same command. The two are not competing affordances: the toolbar toggle is where the command always lives, and the banner's is scoped to the state it is reporting, reachable from wherever the user's attention already is. This is the one place the repo keeps two controls for one command deliberately, and it is what Discord does — so it is a carve-out to apply, not a finding to re-raise.
- If a slot exists only to re-render the default value (`{{ item.name }}`), delete the slot and let the default rendering do it.
