# Scrollspy sub-nav (two-level list + `useElementVisibility` + `useVGoTo`)

Read when a sidebar must track which section is scrolled into view — a settings-style surface with a two-level nav.

- **Two-level nav** — `v-list` with `:opened="[activeCategory]"` (controlled, so only the active category expands) + a `v-list-group` per category. Sub-items render the active category's sections.
- **Scroll tracking — `useElementVisibility` per section, active = topmost visible.** Each section reports its own visibility (`const isVisible = useElementVisibility(sectionRef)`) into a shared `Set` of visible section ids; the active section is the **first in section order that is in the set**. `useElementVisibility` wraps `IntersectionObserver` but exposes only a settled `isVisible` boolean, so the shared set changes solely when a section crosses in or out of the viewport — far coarser than the raw observer's per-entry callback, which re-fires on _any_ intersection change. **Do NOT wire the raw observer callback yourself via `v-intersect`**: it hands you `IntersectionObserverEntry`s on every ratio change, so an in-content reflow (a warning toggling, a slider expanding) spuriously moves the sidebar highlight even when no section crossed the edge. Boolean-visibility topmost-selection needs no `rootMargin` band math or bottom-edge special-casing.
- **Keep the header outside the scroll container**, not `sticky` inside it — a section clipped above the scroll area is then genuinely not visible, so "topmost visible" and `goTo`'s landing position are both header-aware with no offset hack.
- **Click-to-scroll** — `useVGoTo()` (auto-imported, `v` prefix), scrolling within the panel's scroll container: `goTo(element, { container: '#<scroll-container-id>' })`. Resolve the target with `document.getElementById(id)` so ids may contain spaces (enum values), avoiding selector escaping.
- **Click vs. scrollspy race** — set the active id immediately on click, and guard the visibility watcher with an `isScrollingToSection` flag (true before `await goTo(...)`, false after) so the animated scroll keeps the clicked value.

Section identity comes from a **per-subsection enum** whose values double as titles and DOM ids; a `Record<ParentType, EnumValues[]>` map drives the sidebar sub-items.

## Animated active rail — `StyledSlideIndicator`

For the sliding bar that follows the active item, reuse the generic `StyledSlideIndicator` (`components/Styled/SlideIndicator.vue`) — don't hand-roll one per sidebar. Drop-in contract:

- Place it inside a `position: relative` container (in a `v-list-group` that's `.v-list-group__items` — set it relative via a scoped `:deep`).
- Give each item `data-slide-indicator-key="<key>"`.
- Pass `:active-key="<activeKey>"`.

It measures the active item's `offsetTop`/`offsetHeight` (so it handles varying item heights) and animates via `transform: translateY`, re-measuring on `activeKey` change and container resize (`useResizeObserver`). Works for any vertical nav, not just settings.
