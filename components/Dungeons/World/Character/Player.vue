<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { type Position } from "grid-engine";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const playerStore = usePlayerStore();
const { character } = storeToRefs(playerStore);
const position = ref<Position>({ x: 1, y: 1 });

onUnmounted(() => {
  scene.value.cameras.main.stopFollow();
});
</script>

<template>
  <DungeonsWorldCharacter
    :id="CharacterId.Player"
    v-model:position="position"
    :asset="character.asset"
    :on-complete="
      (sprite) => {
        scene.cameras.main.startFollow(sprite, true);
        scene.cameras.main.setFollowOffset(-sprite.width, -sprite.height);
      }
    "
  />
</template>
