<script setup lang="ts">
import type { ExpeditionCharacter } from "#src/models/ExpeditionCharacter";
import type { ExpeditionPlaceDetail } from "#src/models/ExpeditionPlaceDetail";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The picker's heading in the reader's language, the game's "Character Selection"
  characterTitle: string;
  // The characters the picker lists in the game's order, a character away from home shown with its status and not sent
  characters: ExpeditionCharacter[];
  // The picked place, the one the chosen character is sent to
  detail: ExpeditionPlaceDetail;
  // The duration picked, in hours, which a send to the picked place takes
  hours: number;
}

const isPicking = defineModel<boolean>("isPicking", { default: false });
const { characterTitle, characters, detail, hours } = defineProps<Props>();
const emit = defineEmits<{ send: [placeId: number, characterId: number, hours: number] }>();
</script>

<template>
  <section class="characters">
    <p class="characters-title">{{ characterTitle }}</p>
    <ul>
      <li v-for="{ bonusLabel, id, label, statusLabel } of characters" :key="id">
        <!-- The character picked sends the place's expedition for the duration picked, and closes the picker -->
        <GameButton
          class="character"
          :disabled="statusLabel !== ''"
          :kind="GameButtonKind.Row"
          tip=""
          @click="
            () => {
              isPicking = false;
              emit('send', detail.id, id, hours);
            }
          "
        >
          <span class="character-name">{{ label }}</span>
          <span class="character-bonus">{{ bonusLabel }}</span>
          <span v-if="statusLabel" class="character-status">{{ statusLabel }}</span>
        </GameButton>
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* The picker over the map's left, a row a character with its bonus words and its status when it is away */
.characters {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: calc(var(--unit) * 960);
  padding: calc(var(--unit) * 40) calc(var(--unit) * 50);
  box-sizing: border-box;
  background: rgb(31 37 54 / 0.96);
  color: #f3eee3;
}

.characters-title {
  margin: 0 0 calc(var(--unit) * 30);
  color: #d8c8a0;
  font-size: calc(var(--unit) * 30);
}

.characters ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.character {
  display: flex;
  width: 100%;
  height: calc(var(--unit) * 120);
  margin-bottom: calc(var(--unit) * 10);
  padding: 0 calc(var(--unit) * 30);
  flex-direction: column;
  justify-content: center;
  border: none;
  border-radius: calc(var(--unit) * 6);
  background: #3b4560;
  color: inherit;
  font: inherit;
  text-align: left;
}

.character:disabled {
  opacity: 0.5;
}

.character-name {
  font-size: calc(var(--unit) * 34);
}

.character-bonus {
  color: #b9c2d6;
  font-size: calc(var(--unit) * 22);
}

.character-status {
  color: #e3c77a;
  font-size: calc(var(--unit) * 22);
}
</style>
