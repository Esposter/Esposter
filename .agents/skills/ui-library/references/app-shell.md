# The App Shell

Read when a page places a fixed region, scrolls inside its own regions, opens a drawer from an edge, or is one of a kind of thing the dock should mark. The one-line rules are in `SKILL.md`; this page is their full statement.

- **A page that scrolls inside its own regions passes `is-viewport-height` to its layout** — a room, a call, a game — and fills it with an `h-full` column whose scrolling child is `flex-1`; every other page scrolls the window. Nothing in the shell is placed by script: it is one grid whose drawer columns open and shut, and the architecture page's App shell is how. A drawer opened from an edge is `UiDialogPlacement.DrawerStart` or `DrawerEnd` below the desktop breakpoint, arriving from its own side.

- **A page that is one of a kind of thing declares its mark** with `usePageMark` while mounted — the resource page its type — so the dock draws that kind's icon rather than its title's letter. A mark is data resolved to an icon when drawn, never a stored icon class (the architecture page's App shell).
