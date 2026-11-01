<script setup lang="ts">
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The floor the row opens, its index on the button and its chambers, which the row lists once the floor is picked
  floor: AbyssFloor;
  // Whether the floor is the one picked, which the entry holds, since one floor at a time lists its chambers
  isPicked: boolean;
}

const { floor, isPicked } = defineProps<Props>();
const emit = defineEmits<{ choose: [chamberId: number]; pick: [] }>();
</script>

<template>
  <GameButton :kind="GameButtonKind.Pill" tip="" @click="emit('pick')">{{ floor.index }}</GameButton>
  <template v-if="isPicked">
    <GameButton
      v-for="chamber in floor.chambers"
      :key="chamber.id"
      :kind="GameButtonKind.Pill"
      tip=""
      @click="emit('choose', chamber.id)"
    >
      {{ chamber.index }}
    </GameButton>
  </template>
</template>
