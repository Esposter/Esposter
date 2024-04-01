<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { PlayerWalkingAnimationMapping } from "@/services/dungeons/world/constants";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const phaserStore = usePhaserStore();
const { scene, sceneKey } = storeToRefs(phaserStore);
const worldSceneStore = useWorldSceneStore();
const { encounterLayer } = storeToRefs(worldSceneStore);
const playerStore = usePlayerStore();
const { sprite, player, isMoving } = storeToRefs(playerStore);

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${sceneKey.value}`, () => {
  scene.value.cameras.main.stopFollow();
});
</script>

<template>
  <DungeonsWorldCharacter
    v-model:position="player.position"
    v-model:direction="player.direction"
    :character-id="CharacterId.Player"
    :sprite-configuration="{
      texture: SpritesheetKey.Character,
      frame: PlayerWalkingAnimationMapping[player.direction].standing,
    }"
    :walking-animation-mapping="PlayerWalkingAnimationMapping"
    :on-movement-started="
      () => {
        isMoving = true;
      }
    "
    :on-movement-stopped="
      () => {
        isMoving = false;
      }
    "
    :on-position-change-finished="
      ({ enterTile }) => {
        const tile = encounterLayer.getTileAt(enterTile.x, enterTile.y, false);
        if (tile) useRandomEncounter();
      }
    "
    :on-complete="
      (newSprite) => {
        sprite = newSprite;
        scene.cameras.main.startFollow(sprite, true);
        scene.cameras.main.setFollowOffset(-sprite.width, -sprite.height);
      }
    "
  />
</template>
