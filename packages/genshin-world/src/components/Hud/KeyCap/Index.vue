<script setup lang="ts">
interface Props {
  // The key's physical code, whose letter or digit the cap reads
  code: string;
}

const { code } = defineProps<Props>();
</script>

<template>
  <!-- A key's cap as the PC client's HUD draws it by a piece its key presses: the key's letter or digit dark on a white
       Rounded box, 30 by 25 units, measured off the English client's world HUD at 1080 high -->
  <kbd class="key-cap">{{ code.replace(/^(?:Key|Digit)/u, "") }}</kbd>
</template>

<style scoped>
.key-cap {
  display: grid;
  width: calc(var(--unit) * 30);
  height: calc(var(--unit) * 25);
  place-items: center;
  border-radius: calc(var(--unit) * 3);
  background: #fdfdfd;
  color: #2e2b30;
  font-family: inherit;
  font-size: calc(var(--unit) * 20);
  font-weight: 700;
  line-height: 1;
}
</style>
