<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { Collapsible } from "@vuetify/v0";

const isOpen = defineModel<boolean>({ required: true });
// What acts on the whole of its content sits beside the trigger rather than inside it, since a button holds no other
defineSlots<{ actions?: () => VNode; default: () => VNode; title: () => VNode }>();
</script>

<template>
  <Collapsible.Root v-model="isOpen" renderless>
    <div flex gap-2 items-center>
      <Collapsible.Activator #default="{ attrs }" renderless>
        <button :="attrs" ui-item flex flex-1 gap-2 items-center>
          <Collapsible.Cue #default="{ attrs: cueAttrs }" renderless>
            <UiIcon :="cueAttrs" class="cue" :meaning="UiIconMeaning.Disclosure" />
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

<style scoped>
.cue[data-state="open"] {
  rotate: 90deg;
}
</style>
