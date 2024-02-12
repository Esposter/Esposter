<script setup lang="ts">
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { type Position } from "grid-engine";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const playerStore = usePlayerStore();
const { character } = storeToRefs(playerStore);
const position = ref<Position>({ x: 6, y: 21 });
const destroyListener = () => {
  scene.value.cameras.main.stopFollow();
};

onMounted(() => {
  phaserEventEmitter.on(`${DESTROY_SCENE_EVENT_KEY}${SceneKey.World}`, destroyListener);
});

onUnmounted(() => {
  phaserEventEmitter.off(`${DESTROY_SCENE_EVENT_KEY}${SceneKey.World}`, destroyListener);
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
