<script setup lang="ts">
interface ClickerModelListGroupProps {
  icon: string;
  title: string;
}

const { icon, title } = defineProps<ClickerModelListGroupProps>();
</script>

<template>
  <v-list-group>
    <template #activator="{ props }">
      <v-list-item :="props">
        <template #prepend>
          <v-avatar color="background">
            <v-icon :icon />
          </v-avatar>
        </template>
        <v-list-item-title font-bold>{{ title }}</v-list-item-title>
      </v-list-item>
    </template>
    <slot />
  </v-list-group>
</template>
