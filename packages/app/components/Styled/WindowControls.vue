<script setup lang="ts">
const emit = defineEmits<{ clickLeft: [event: MouseEvent]; clickRight: [event: MouseEvent] }>();
</script>

<template>
  <div class="v-window__controls" w-dvw="!">
    <v-tooltip location="right center" text="Left">
      <template #activator="{ props }">
        <!-- @vue-ignore @TODO: Remove this when typescript + vue-tsc is fixed... some day. -->
        <v-btn icon="mdi-chevron-left" size="small" :="props" @click="(event) => emit('clickLeft', event)" />
      </template>
    </v-tooltip>
    <v-tooltip location="left center" text="Right">
      <template #activator="{ props }">
        <!-- @vue-ignore @TODO: Remove this when typescript + vue-tsc is fixed... some day. -->
        <v-btn icon="mdi-chevron-right" size="small" :="props" @click="(event) => emit('clickRight', event)" />
      </template>
    </v-tooltip>
  </div>
</template>

<style scoped lang="scss">
.v-window__controls {
  height: calc(100dvh - $app-bar-height); 
}
</style>
