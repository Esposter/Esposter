# Styled Primitives — Lists and Avatars

Read when building a keyboard-navigable list or rendering a user's avatar. Both are wrappers that exist because the hand-rolled form kept being rewritten.

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
