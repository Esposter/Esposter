---
title: Room UI polish
description: Proposal — one polish pass over the room shell: density, resizable sidebars, member grouping, empty states, mobile.
---

# Room / Sidebar UI Polish

One cohesive polish pass over the room shell. Each item is small and independent; the pass ships incrementally in this order.

## Scope

**Today:** the shell works but lacks Discord's refinements. **This adds**, in priority order:

1. **Role-colored member grouping** — member list grouped by highest hoisted role, name tinted with the role color (`roomRoles.color` exists; grouping = sort by top role position).
2. **Resizable, persisted sidebars** — drag handles on the left sidebar and member list; widths in `localStorage` (device-local UI state, per the [settings](/docs/esbabbler/settings) persistence rule).
3. **Better empty states** — welcome-style placeholders for empty room list, empty member search, no search results, empty drafts view.
4. **Room header overflow menu** — move low-priority header actions into a `⋮` menu at narrow widths (extends the existing mobile collapse).
5. **Density toggle** — cozy/compact message spacing; a `userSettingsInMessage` column? No — appearance is device-visual, `localStorage`, consistent with theme staying on the cookie.
6. **Mobile action bar** — bottom action bar for the message view on `smAndDown` (composer shortcuts, member list toggle).
7. **Category drag-ordering refinement** — polish the existing drag-reorder affordances (drop indicators, keyboard support).

## How it works

Pure client work; no schema or procedure changes anywhere in the pass. Persisted UI state (sidebar widths, density) is `localStorage` via VueUse `useLocalStorage` in a small `store/message/ui.ts`.

## Key files

| File                                               | Change                               |
| :------------------------------------------------- | :----------------------------------- |
| `packages/app/app/components/Message/LeftSideBar/` | resize handle, empty states          |
| `packages/app/app/components/Message/Content/`     | density, overflow menu, mobile bar   |
| `packages/app/app/store/message/ui.ts`             | new UI-state store (widths, density) |

## Notes

Anything here that grows behaviour (e.g. member-list search server support) leaves this proposal and gets its own page — this pass is visual/interaction only.
