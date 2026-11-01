<script setup lang="ts">
interface Props {
  // The label and value each row draws, the label at the panel's left and the value flush with its right edge
  rows: { label: string; value: string }[];
}

const { rows } = defineProps<Props>();
</script>

<template>
  <dl class="rows">
    <div v-for="{ label, value } of rows" :key="label" class="row">
      <dt>{{ label }}</dt>
      <dd class="value">{{ value }}</dd>
    </div>
  </dl>
</template>

<style scoped src="../../../../styles/attributeValue.css"></style>

<style scoped>
.rows {
  margin: calc(var(--unit) * 5) 0 0;
}

.row {
  display: flex;
  justify-content: space-between;
  line-height: calc(var(--unit) * 36);
}
</style>
