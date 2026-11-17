<script setup lang="ts">
interface Props {
  // The heading over the team's members, in the reader's language
  heading: string;
  // The hint beside the heading, when the team has one
  hint?: string | undefined;
  // Whether the team is waiting rather than deployed, which sets it lower on the screen
  isWaiting?: true | undefined;
}

defineSlots<{ default: () => unknown }>();
defineProps<Props>();
</script>

<template>
  <section class="section" :class="{ waiting: isWaiting }">
    <span class="diamond" aria-hidden="true" />
    <p class="heading" role="heading" aria-level="2">{{ heading }}</p>
    <p v-if="hint !== undefined" class="hint">{{ hint }}</p>
    <slot />
  </section>
</template>

<style scoped>
.section {
  position: absolute;
  top: 0;
  left: 0;
}

/* A waiting team starts 261 units below a deployed one, as the clip's two headings do */
.waiting {
  top: calc(var(--unit) * 261);
}

/* A heading's diamond stands at the head's left, the heading's words set after it */
.diamond {
  position: absolute;
  top: calc(var(--unit) * 42.5);
  left: calc(var(--unit) * 33.5);
  width: calc(var(--unit) * 9);
  height: calc(var(--unit) * 9);
  background: #c9ccc4;
  rotate: 45deg;
}

/* The words in the game's white heading face, tracked to the reference's width, since its face sets wider than the one
   drawn here */
.heading {
  position: absolute;
  top: calc(var(--unit) * 30);
  left: calc(var(--unit) * 57);
  margin: 0;
  color: #e5e7e1;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 2.8);
  line-height: calc(var(--unit) * 32);
  white-space: nowrap;
}

/* The hint beside the heading is set in the gold the game gives its instructions */
.hint {
  position: absolute;
  top: calc(var(--unit) * 34);
  left: calc(var(--unit) * 223);
  margin: 0;
  color: #cbbd8e;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 2.4);
  line-height: calc(var(--unit) * 28);
  white-space: nowrap;
}
</style>
