<script setup lang="ts">
interface Props {
  // The picked entry's description, drawn under its name, or "" for an entry without one or still unopened
  description: string;
  // The picked entry's name, absent while the section has no entry to pick
  name?: string;
}

const { description, name } = defineProps<Props>();
</script>

<template>
  <p v-if="name !== undefined" class="detail-name">{{ name }}</p>
  <template v-if="description">
    <span class="separator" aria-hidden="true" />
    <span class="book" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="#2b2f3a" stroke-width="2">
        <path d="M2 6Q7 3.5 12 6Q17 3.5 22 6V19Q17 16.5 12 19Q7 16.5 2 19Z M12 6V19" />
      </svg>
    </span>
    <p class="description">{{ description }}</p>
  </template>
</template>

<style scoped>
.detail-name {
  position: absolute;
  top: calc(var(--unit) * 841);
  right: calc(var(--unit) * 115);
  margin: 0;
  color: #d5c08f;
  font-size: calc(var(--unit) * 42);
  font-weight: 600;
  line-height: calc(var(--unit) * 52);
  letter-spacing: calc(var(--unit) * 1.6);
  white-space: nowrap;
}

/* The picked entry's lore sits under a rule, beside a round book mark, in the game's grey */
.separator {
  position: absolute;
  top: calc(var(--unit) * 888);
  left: calc(var(--unit) * 1388);
  width: calc(var(--unit) * 480);
  height: calc(var(--unit) * 2);
  background: #434c63;
}

.book {
  position: absolute;
  top: calc(var(--unit) * 840);
  left: calc(var(--unit) * 1813);
  display: flex;
  width: calc(var(--unit) * 50);
  height: calc(var(--unit) * 50);
  border-radius: 50%;
  background: #e8e5dc;
  align-items: center;
  justify-content: center;
}

.book svg {
  width: calc(var(--unit) * 36);
  height: calc(var(--unit) * 36);
}

.description {
  position: absolute;
  top: calc(var(--unit) * 898);
  left: calc(var(--unit) * 1390);
  width: calc(var(--unit) * 480);
  margin: 0;
  color: #9ea7bf;
  font-size: calc(var(--unit) * 25);
  font-weight: 600;
  line-height: calc(var(--unit) * 26);
  letter-spacing: calc(var(--unit) * 0.6);
}
</style>
