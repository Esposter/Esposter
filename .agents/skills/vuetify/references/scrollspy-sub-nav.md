# Scrollspy sub-nav (`v-list` two-level nav + `useVGoTo`)

Read when a Vuetify sidebar must track which section is scrolled into view — a settings-style surface with a two-level nav.

**The scrollspy itself is not yours to write.** `useVisibleSectionIds` decides which sections are on screen and `StyledSlideIndicator` draws the rail; the mechanism, its guarantees and the instruments it bans (`v-intersect`, scroll handlers, a click-tracked "active section" in a store) are owned by `packages/app/content/docs/architecture/section-navigation.md`. This page is only the Vuetify wiring around it.

- **Two-level nav** — `v-list` with `:opened="[activeCategory]"` (controlled, so only the active category expands) + a `v-list-group` per category. Sub-items render the active category's sections, and each carries `data-slide-indicator-key="<sectionId>"` with `:active="visibleSectionIds.includes(section)"`.
- **Click-to-scroll** — `useVGoTo()` (auto-imported, `v` prefix), scrolling within the panel's scroll container: `goTo(element, { container: '#<scroll-container-id>' })`. Resolve the target with `window.document.getElementById(id)` so ids may contain spaces (enum values), avoiding selector escaping. On a page that scrolls with the window, use a `NuxtLink` hash target instead — no `goTo` and no handler.
- **Keep the header outside the scroll container**, not `sticky` inside it — a section clipped above the scroll area is then genuinely not visible, so "on screen" and `goTo`'s landing position agree with no offset hack.
- **The rail's positioning context is the `v-list`, not a group's items.** One bar per list, set `position: relative` on the list via a scoped `:deep(.v-list)` — inside `.v-list-group__items` it is clipped while the group expands, and a bar per group cannot slide across a boundary.

Section identity comes from a **per-subsection enum** whose values double as titles and DOM ids; a `Record<ParentType, EnumValues[]>` map drives the sidebar sub-items and is the id list handed to `useVisibleSectionIds`.
