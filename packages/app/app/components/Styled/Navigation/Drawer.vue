<script setup lang="ts">
interface Props {
  permanent?: boolean;
}

defineSlots<{ default: () => VNode }>();
const { permanent } = defineProps<Props>();
const isOpen = defineModel<boolean>({ required: true });
</script>

<!-- Every drawer in the app wants the same thing: while it is permanent it is simply open, and the model is the
     open state of the overlay it becomes when it is not. Vuetify does not give that for free — a permanent drawer
     still honours `model-value` and only forces itself open when `permanent` *changes* to true, so binding a model
     that starts closed leaves the rail inert for the whole session, and any handler that closes the overlay closes
     the rail with it -->
<template>
  <v-navigation-drawer :model-value="permanent || isOpen" :permanent @update:model-value="isOpen = $event">
    <slot />
  </v-navigation-drawer>
</template>
