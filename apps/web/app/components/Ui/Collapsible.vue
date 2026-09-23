<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { Collapsible } from "@vuetify/v0";

const isOpen = defineModel<boolean>({ required: true });
defineSlots<{ default: () => VNode; title: () => VNode }>();
</script>

<template>
  <Collapsible.Root v-model="isOpen" renderless>
    <Collapsible.Activator #default="{ attrs }" renderless>
      <button :="attrs" gap-2 items-center flex ui-item>
        <Collapsible.Cue #default="{ attrs: cueAttrs }" renderless>
          <UiIcon :="cueAttrs" class="cue" :meaning="UiIconMeaning.Disclosure" />
        </Collapsible.Cue>
        <slot name="title" />
      </button>
    </Collapsible.Activator>
    <!-- A disclosure, not a landmark: a region per group would crowd the landmarks a screen reader lists -->
    <Collapsible.Content #default="{ attrs }" renderless>
      <div :="{ ...attrs, role: undefined }">
        <slot />
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</template>

<style scoped>
.cue[data-state="open"] {
  rotate: 90deg;
}
</style>
