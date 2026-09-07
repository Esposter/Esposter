<script setup lang="ts">
interface Props {
  displayTime: string;
  subtitle: string;
  title: string;
}

defineOptions({ inheritAttrs: false });
defineSlots<{ default?: () => VNode; prepend?: () => VNode }>();
const { displayTime, subtitle, title } = defineProps<Props>();
const listItem = useTemplateRef("listItem");
// @ts-expect-error TS2590: Expression produces a union type that is too complex to represent.
const { focused: isFocusWithin } = useFocusWithin(listItem);
</script>

<template>
  <v-hover #default="{ isHovering, props }">
    <v-list-item ref="listItem" :="{ ...props, ...$attrs }">
      <template #prepend>
        <slot name="prepend" />
      </template>
      <v-list-item-title font-bold>{{ title }}</v-list-item-title>
      <v-list-item-subtitle>
        <span v-html="subtitle" />
      </v-list-item-subtitle>
      <template #append>
        <div flex gap-x-3 items-center>
          <span text-hint>{{ displayTime }}</span>
          <v-sheet
            v-if="$slots.default"
            v-show="isHovering || isFocusWithin"
            p-1
            b-1
            b-border
            rd-lg
            b-solid
            flex
            items-center
          >
            <slot />
          </v-sheet>
        </div>
      </template>
    </v-list-item>
  </v-hover>
</template>
