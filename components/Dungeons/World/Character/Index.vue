<script setup lang="ts">
import Sprite from "@/lib/phaser/components/Sprite.vue";
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { type Asset } from "@/models/dungeons/Asset";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { type CharacterId } from "@/models/dungeons/world/CharacterId";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { type Position } from "grid-engine";
import { type GameObjects } from "phaser";
import { filter, type Subscription } from "rxjs";

interface CharacterProps {
  id: CharacterId;
  asset: Asset;
  onComplete?: (sprite: GameObjects.Sprite) => void;
}

const { id, asset } = defineProps<CharacterProps>();
const position = defineModel<Position | undefined>("position", { required: true });
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const worldSceneStore = useWorldSceneStore();
const { encounterLayer } = storeToRefs(worldSceneStore);
const subscription = ref<Subscription>();
const destroyListener = () => {
  subscription.value?.unsubscribe();
  scene.value.gridEngine.removeCharacter(id);
};

onMounted(() => {
  phaserEventEmitter.on(`${DESTROY_SCENE_EVENT_KEY}${SceneKey.World}`, destroyListener);
});

onUnmounted(() => {
  phaserEventEmitter.off(`${DESTROY_SCENE_EVENT_KEY}${SceneKey.World}`, destroyListener);
});
</script>

<template>
  <Sprite
    :configuration="{ textureKey: asset.key, frame: asset.frame, origin: 0 }"
    :on-complete="
      (sprite) => {
        scene.gridEngine.addCharacter({
          id,
          sprite,
          walkingAnimationMapping: {
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
          },
          startPosition: position,
        });
        subscription = scene.gridEngine
          .positionChangeFinished()
          .pipe(filter(({ charId }) => charId === id))
          .subscribe(({ enterTile }) => {
            position = enterTile;

            const tile = encounterLayer.getTileAt(enterTile.x, enterTile.y, false);
            if (!tile) return;

            useRandomEncounter();
          });
        onComplete?.(sprite);
      }
    "
  />
</template>
