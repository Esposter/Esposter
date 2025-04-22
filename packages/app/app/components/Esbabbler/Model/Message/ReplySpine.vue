<script setup lang="ts">
const { border } = useColors();
</script>

<template>
  <div class="custom-border" b-l-2="!" b-t-2="!" w-8 h-2 rd-tl-1 />
</template>

<style scoped lang="scss">
.custom-border {
  border: 0px $border-style-root v-bind(border);
}
</style>
