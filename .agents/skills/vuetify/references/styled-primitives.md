# Styled Primitives — Lists, Avatars, and What Is Deliberately Not One

Read when building a keyboard-navigable list, rendering a user's avatar, or wondering why a tooltip around a text button has no wrapper. The first two are wrappers that exist because the hand-rolled form kept being rewritten; the last is the case where that reasoning does not hold.

## Keyboard-navigable lists — `StyledList`

Use `<StyledList>` instead of `<v-list>` whenever a list supports arrow-key navigation — it takes `selectedIndex?: number`, `listProps?: VList["$props"]`, `listAttrs?: VList["$attrs"]` and auto smooth-scrolls to the active item (`{ behavior: 'smooth', block: 'nearest' }`, only when out of view). Never replicate `watch(selectedIndex) → scrollIntoView` manually.

```vue
<StyledList :selected-index="selectedIndex" :list-props="{ density: 'compact' }">
  <v-list-item v-for="..." :active="selectedIndex === index" ... />
</StyledList>
```

## User avatars — `StyledAvatar`

**Always `<StyledAvatar>`** — never inline `v-avatar` + image + fallback `<span>`; it shows a `NuxtImg` when `image` is set and falls back to `StyledDefaultAvatar`.

Props: `image?: User["image"]`, `name: User["name"]`, `avatarProps?: VAvatar["$props"]`, `avatarAttrs?: VAvatar["$attrs"]` — the two are combined with `mergeProps(avatarAttrs, avatarProps)` onto whichever root renders, so activator/tooltip slot props go through `avatarAttrs`.

```vue
<StyledAvatar mr-3 :image="user.image" :name="user.name" :avatar-props="{ size: '2.25rem' }" />
```

## There is no `StyledTooltipButton`, and that is the answer

`StyledTooltipIconButton` exists because an **icon** button has no accessible name of its own, so the tooltip
text is also its `aria-label` and the pair has to be built together every time. A **text** button already reads
its own label, so its tooltip is an ordinary optional wrapper — and wrapping it buys nothing, because the shared
part is `v-tooltip` plus an `#activator` template that spreads its slot props, and a primitive around that still
has to hand those props back through a slot. That is `v-tooltip` again with an extra file in front of it.

So a text button with a tooltip writes the `v-tooltip` + `#activator` stack inline, and the inline form is not a
missing-primitive finding. It also cannot be one primitive in practice: the inner element is `v-btn` on some
surfaces and `StyledButton` on others, which the wrapper would have to take as a prop — at which point the call
site is longer than the stack it replaced.
