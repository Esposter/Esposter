<script setup lang="ts">
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import { CharacterId } from "@/models/dungeons/scene/world/CharacterId";
import { PlayerWalkingAnimationMapping } from "@/services/dungeons/scene/world/constants";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Direction } from "grid-engine";

const worldSceneStore = useWorldSceneStore();
const { encounterLayer } = storeToRefs(worldSceneStore);
const playerStore = usePlayerStore();
const { player } = storeToRefs(playerStore);
const worldPlayerStore = useWorldPlayerStore();
const { sprite, isMoving } = storeToRefs(worldPlayerStore);
// We only care about the starting frame, so we don't want this to be reactive
const frame =
  PlayerWalkingAnimationMapping[player.value.direction === Direction.NONE ? Direction.DOWN : player.value.direction]
    .standing;

onShutdown((scene) => {
  scene.cameras.main.stopFollow();
});
</script>

<template>
  <DungeonsWorldCharacter
    :id="CharacterId.Player"
    v-model:position="player.position"
    v-model:direction="player.direction"
    :sprite-configuration="{ texture: SpritesheetKey.Character, frame }"
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
      (scene, { enterTile }) => {
        const tile = encounterLayer.getTileAt(enterTile.x, enterTile.y, false);
        if (tile) {
          const { play } = useDungeonsSoundEffect(scene, SoundEffectKey.StepGrass);
          play();
          useRandomEncounter(scene);
        }
      }
    "
    :on-complete="
      (scene, newSprite) => {
        sprite = newSprite;
        scene.cameras.main.startFollow(sprite, true);
        scene.cameras.main.setFollowOffset(-sprite.width, -sprite.height);
      }
    "
  />
</template>
