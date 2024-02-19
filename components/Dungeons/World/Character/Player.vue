<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const phaserStore = usePhaserStore();
const { scene, sceneKey } = storeToRefs(phaserStore);
const worldSceneStore = useWorldSceneStore();
const { encounterLayer } = storeToRefs(worldSceneStore);
const playerStore = usePlayerStore();
const { sprite, position, direction, isMoving } = storeToRefs(playerStore);

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${sceneKey.value}`, () => {
  scene.value.cameras.main.stopFollow();
});
</script>

<template>
  <DungeonsWorldCharacter
    v-model:position="position"
    v-model:direction="direction"
    :character-id="CharacterId.Player"
    :sprite-configuration="{ textureKey: SpritesheetKey.Character, frame: 7 }"
    :walking-animation-mapping="{
      up: {
        leftFoot: 0,
        standing: 1,
        rightFoot: 2,
      },
      down: {
        leftFoot: 6,
        standing: 7,
        rightFoot: 8,
      },
      left: {
        leftFoot: 9,
        standing: 10,
        rightFoot: 11,
      },
      right: {
        leftFoot: 3,
        standing: 4,
        rightFoot: 5,
      },
    }"
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
