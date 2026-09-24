# The Design Pass

Read before building a unit of the page migration, or a library component, and again before handing it over. The migration is a revamp of the design system, not a repaint: a unit that keeps Vuetify's arrangement in the library's colours has only done half its job. Each question is asked of the unit in front of you, and the answer is either a change or a sentence saying why nothing changes.

## The questions

- **Does anything appear, disappear or change without motion?** A dialog, a popover, a toast, a thread opening, a row arriving. The library's motion is eased, never stepped — stepped frames read as dropped frames and make a pop-in feel slow. A transition names one of the motion tokens beside `--ui-step`, which carry the duration and the one curve and are held still under reduced motion. Motion says where something came from or went, never decorates a frequent action, and is never the only carrier of a meaning (Apple's HIG, Motion). A top-layer dialog or popover animates in from `@starting-style` and out with `transition-behavior: allow-discrete` on `display` and `overlay`, so it leaves as smoothly as it arrived.
- **Is it where the eye goes for it?** A confirmation is a decision about one thing, so it sits in the middle of the screen; a palette whose list changes length sits high, so its field never moves. A choice about placement follows from what the surface is for, never from what the component happened to do. A modal is only for what must interrupt — a destructive or irreversible act (NN/g, Modal and Nonmodal Dialogs); anything else is a popover or a panel beside the content.
- **Does it use the room it has?** A page takes the main region's full width. A readable measure is for running prose alone, never a cap on a feed or a form, and nothing is boxed only to fill space.
- **Is there one thing to do first?** One accent action per surface, headings in the type scale, and every other control quieter than the content it acts on. Feedback lands within 400ms, or a spinner or skeleton says it is on its way (the Doherty threshold).
- **Is every state designed?** Empty, loading, error, hover, focus, pressed, disabled, narrow and signed out each have a look of their own. A state that is only the absence of another is a missing state.
- **What is its signature?** One detail per unit that the reference product does not have: a block that drops, a pixel mark, a reveal. It is drawn through the library's rules and tokens, never by hand in the unit, so a design style can redraw it (`apps/web/content/docs/architecture/ui-library.md`, "Design styles"). It is decoration, so it is never the only way to read anything.
- **Is it better than the reference product, or only like it?** Name what the reference does, and where this departs, say how it is better. Like it is the floor, not the goal.

## Where great is looked up

Never from memory. Before a unit is designed, look up how the best shipped products solve the same screen, then the systems that explain why it works. Every source the app draws on, what each one gave it, and the order they are consulted in are `apps/web/content/docs/architecture/design-sources.md` — the one list, so it is read there rather than copied here. Search the web whenever the answer is not already on it, cite what the design took in the commit body, and add a source the day a shipped surface takes something from it, with the line saying what.

## What it does not license

- **Losing a flow.** A redesign keeps every row of the unit's inventory (`SKILL.md`, "Migrating a unit").
- **A choice of taste made alone.** Where two answers are both good, the user picks from mockups — described as they look on a wide screen, not only as a sketch.
