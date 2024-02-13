<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { filter, type Subscription } from "rxjs";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const worldSceneStore = useWorldSceneStore();
const { encounterLayer } = storeToRefs(worldSceneStore);
const playerStore = usePlayerStore();
const { character, position, direction: playerDirection, isMoving } = storeToRefs(playerStore);
const subscriptionPositionChangeStarted = ref<Subscription>();
const subscriptionPositionChangeFinished = ref<Subscription>();
const subscriptionDirectionChanged = ref<Subscription>();

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${SceneKey.World}`, () => {
  scene.value.cameras.main.stopFollow();
  subscriptionPositionChangeStarted.value?.unsubscribe();
  subscriptionPositionChangeFinished.value?.unsubscribe();
  subscriptionDirectionChanged.value?.unsubscribe();
});
</script>

<template>
  <DungeonsWorldCharacter
    :id="CharacterId.Player"
    :start-position="position"
    :facing-direction="playerDirection"
    :asset="character.asset"
    :on-complete="
      (sprite) => {
        scene.cameras.main.startFollow(sprite, true);
        scene.cameras.main.setFollowOffset(-sprite.width, -sprite.height);
        subscriptionPositionChangeStarted = scene.gridEngine
          .positionChangeStarted()
          .pipe(filter(({ charId }) => charId === CharacterId.Player))
          .subscribe(() => {
            isMoving = true;
          });
        subscriptionPositionChangeFinished = scene.gridEngine
          .positionChangeFinished()
          .pipe(filter(({ charId }) => charId === CharacterId.Player))
          .subscribe(({ enterTile }) => {
            position = enterTile;

            const tile = encounterLayer.getTileAt(enterTile.x, enterTile.y, false);
            if (tile) useRandomEncounter();

            isMoving = false;
          });
        subscriptionDirectionChanged = scene.gridEngine
          .directionChanged()
          .pipe(filter(({ charId }) => charId === CharacterId.Player))
          .subscribe(({ direction }) => {
            playerDirection = direction;
          });
      }
    "
  />
</template>
