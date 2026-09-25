<script setup lang="ts">
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  // A line after the title saying more, in the muted colour
  description?: string;
  // An icon class written whole, for a glyph no meaning names
  icon?: string;
  // A picture in the mark's place, or the title's first letter when it is empty: a room's
  image?: string;
  // What the mark says, drawn in the nearest style's glyph
  meaning?: UiIconMeaning;
  // In Vuetify 0's hotkey syntax, drawn at the row's end
  shortcut?: string;
  title: string;
}
// What one row of a list shows, whichever list holds it: a mark, the title and its description, and at the end the row's
// Shortcut. The mark's column is kept on a row without one, so every title in a list starts on one line. The row's own
// Element, its role and its state are the list's, which lays these out as the `ui-item` row does. A mark no prop can
// Name, such as a provider's own logo component, fills the mark's slot, and a title drawn in a colour of the row's own,
// Such as a member's top role's, fills the title's
defineSlots<{ append?: () => VNode; mark?: () => VNode; title?: () => VNode }>();
const { description, icon, image, meaning, shortcut, title } = defineProps<Props>();
</script>

<template>
  <span aria-hidden="true" flex shrink-0 size-6 items-center justify-center>
    <slot name="mark">
      <UiAvatar v-if="image !== undefined" :image :name="title" is-small />
      <UiIcon v-else-if="meaning" :meaning />
      <span v-else-if="icon" :class="icon" size-6 />
    </slot>
  </span>
  <span flex-1 min-w-0 truncate>
    <slot name="title">{{ title }}</slot> <span v-if="description" text-muted>{{ description }}</span>
  </span>
  <UiShortcut v-if="shortcut" :shortcut />
  <slot name="append" />
</template>
