<script setup lang="ts">
// @NOTE: Will be fixed in Vue 3.3
// const props = defineProps<typeof VCard>();
</script>

<template>
  <v-btn class="button">
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :key="slot" :name="slot" :="scope" />
    </template>
  </v-btn>
</template>

<style scoped lang="scss">
.button {
  background-image: $midnightBloom !important;
}
</style>
