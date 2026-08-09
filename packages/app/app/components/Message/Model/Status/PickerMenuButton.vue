<script setup lang="ts">
defineSlots<{ activator: (props: { menuProps: Record<string, unknown> }) => VNode }>();

const isOpen = ref(false);
</script>

<template>
  <v-menu v-model="isOpen" location="top" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <slot name="activator" :menu-props />
    </template>
    <MessageModelStatusPickerForm @save="isOpen = false" />
  </v-menu>
</template>
