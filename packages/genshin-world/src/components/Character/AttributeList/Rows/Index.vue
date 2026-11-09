<script setup lang="ts">
interface Props {
  // The label and value each row draws, the label at the panel's left and the value flush with its right edge
  rows: { label: string; value: string }[];
}

defineProps<Props>();
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

/* The values end about 2 pixels of the reference's frame in from the panel's edge, measured off its rows' ink */
.value {
  margin-right: calc(var(--unit) * 1.75);
}

/* Each label sits 27 units in from the panel's edge, past the stat's icon the game draws there, which this panel does
   not draw */
dt {
  padding-left: calc(var(--unit) * 27);
  font-size: calc(var(--unit) * 25);
}
</style>
