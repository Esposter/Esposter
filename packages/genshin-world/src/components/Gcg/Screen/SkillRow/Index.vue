<script setup lang="ts">
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import GcgScreenSkill from "#src/components/Gcg/Screen/Skill/Index.vue";

interface Props {
  // Whether the skills cannot be used at this moment
  isDisabled: boolean;
  // The active character's skills in the order the board shows them
  skills: GcgSkill[];
}

const { isDisabled, skills } = defineProps<Props>();
const emit = defineEmits<{ select: [skillId: number] }>();
</script>

<template>
  <!-- The active character's skill coins along the board's lower right, each one's cost in a token beneath it -->
  <div class="skills">
    <GcgScreenSkill
      v-for="skill in skills"
      :key="skill.id"
      :costs="skill.costs"
      :is-disabled="isDisabled"
      @select="emit('select', skill.id)"
    />
  </div>
</template>

<style scoped>
/* The skill coins sit 108 apart, 94 across, their costs in a token beneath each, as the frame draws them */
.skills {
  position: absolute;
  top: calc(var(--unit) * 908);
  left: calc(var(--unit) * 1560);
  display: flex;
  gap: calc(var(--unit) * 14);
}
</style>
