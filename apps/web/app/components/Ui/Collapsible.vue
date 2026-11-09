<script setup lang="ts">
import type { UiCollapsibleVariant } from "@/models/ui/UiCollapsibleVariant";

import { Collapsible } from "@vuetify/v0";

interface Props {
  // What the header row takes beside its trigger and actions, such as the props that open a context menu over it
  headerAttrs?: Record<string, unknown>;
  variant?: UiCollapsibleVariant;
}
// What acts on the whole of its content sits beside the trigger rather than inside it, since a button holds no other
defineSlots<{ actions?: () => VNode; default: () => VNode; title: () => VNode }>();
const isOpen = defineModel<boolean>({ required: true });
defineProps<Props>();
</script>

<template>
  <Collapsible.Root v-model="isOpen" renderless>
    <div :="headerAttrs" flex gap-2 items-center>
      <Collapsible.Activator #default="{ attrs }" renderless>
        <button :="attrs" ui-header-trigger ui-item flex-1 :data-variant="variant">
          <Collapsible.Cue #default="{ attrs: cueAttrs }" renderless>
            <UiDisclosureIcon :="cueAttrs" />
          </Collapsible.Cue>
          <slot name="title" />
        </button>
      </Collapsible.Activator>
      <slot name="actions" />
    </div>
    <!-- A disclosure, not a landmark: a region per group would crowd the landmarks a screen reader lists -->
    <Collapsible.Content #default="{ attrs }" renderless>
      <div :="{ ...attrs, role: undefined }">
        <slot />
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</template>
