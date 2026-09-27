# The App Shell

Read when a page places a fixed region, scrolls inside its own regions, has a drawer, or is one of a kind of thing the dock should mark. The one-line rules are in `SKILL.md`; this page is their full statement.

- **A page that scrolls inside its own regions passes `is-viewport-height` to its layout** — a room, a call, a game — and fills it with an `h-full` column whose scrolling child is `flex-1`; every other page scrolls the window.

- **A page with a drawer places `AppDrawerButton` in its own header**, and never wires a drawer toggle of its own — without one, a phone has no way into the drawer. The layout itself — the grid, the drawers, the height mode and which part draws each surface — is `apps/web/content/docs/architecture/page-layout.md`.

- **A page that is one of a kind of thing declares its mark** with `usePageMark` while mounted — the resource page its type — so the dock draws that kind's icon rather than its title's letter. A mark is data resolved to an icon when drawn, never a stored icon class (the architecture page's App shell).
