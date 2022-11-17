<script setup lang="ts">
// @NOTE: Will be fixed in Vue 3.3
// const props = defineProps<typeof VCard>();
const slots = useSlots();
const { surface } = useColors();
</script>

<template>
  <v-btn class="button">
    <!-- @NOTE: We should also be able to access slots on the server -->
    <ClientOnly>
      <template v-for="(_, slot) of slots" #[slot]="scope">
        <slot :name="slot" :="{ ...scope }" />
      </template>
    </ClientOnly>
  </v-btn>
</template>

<style scoped lang="scss">
.button {
  color: white;
  background-image: $midnightBloom !important;
}
</style>
