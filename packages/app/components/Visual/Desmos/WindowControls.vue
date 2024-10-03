<script setup lang="ts">
const emit = defineEmits<{ clickLeft: [event: MouseEvent]; clickRight: [event: MouseEvent] }>();
</script>

<template>
  <div class="v-window__controls" fixed="!" top-auto="!" bottom-0="!">
    <v-tooltip location="right center" text="Left">
      <template #activator="{ props }">
        <v-btn icon="mdi-chevron-left" size="small" :="props" @click="emit('clickLeft', $event)" />
      </template>
    </v-tooltip>
    <v-tooltip location="left center" text="Right">
      <template #activator="{ props }">
        <v-btn icon="mdi-chevron-right" size="small" :="props" @click="emit('clickRight', $event)" />
      </template>
    </v-tooltip>
  </div>
</template>

<style scoped lang="scss">
.v-window__controls {
  height: calc(100dvh - $app-bar-height);
}
</style>
