<script setup lang="ts">
interface Props {
  // Each combat talent's level, in the order the game lists them: the normal attack, the Elemental Skill and the
  // Elemental Burst
  levels: number[];
}

const { levels } = defineProps<Props>();
</script>

<template>
  <!-- The Talents tab's panel: the three combat talents down its right, each with its level. The passives under them
       and the talents' names are not drawn yet, since the game's text for them is not decoded -->
  <div class="talents">
    <ul class="talent-list">
      <li v-for="(level, index) in levels" :key="index" class="talent">
        <span class="level">{{ level }}</span>
        <span class="icon" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's Talents tab at 21:9 (references/character-talents.png, 159 seconds), in units
   from the panel's top: the three combat talents' rows sit 90 units apart from 29, each with its icon at the panel's
   right edge. A pixel of that frame at 1440 high is 0.75 units. Colours are provisional */
.talents {
  position: absolute;
  inset: 0;
  color: #fff;
}

.talent-list {
  position: absolute;
  top: calc(var(--unit) * 29);
  right: 0;
  left: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.talent {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: calc(var(--unit) * 60);
  margin-bottom: calc(var(--unit) * 30);
  gap: calc(var(--unit) * 16);
}

.level {
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  text-shadow: 0 calc(var(--unit) * 1) calc(var(--unit) * 3) rgb(0 0 0 / 0.4);
}

.icon {
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 40);
  border-radius: 50%;
  background: rgb(255 255 255 / 0.25);
}
</style>
