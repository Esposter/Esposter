<script setup lang="ts">
import Sprite from "@/lib/phaser/components/Sprite.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { type Asset } from "@/models/dungeons/Asset";
import { type CharacterId } from "@/models/dungeons/world/CharacterId";
import { type Position } from "grid-engine";
import { filter } from "rxjs";

interface CharacterProps {
  id: CharacterId;
  asset: Asset;
}

const { id, asset } = defineProps<CharacterProps>();
const position = defineModel<Position | undefined>("position", { required: true });
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);

onBeforeUnmount(() => {
  scene.value.gridEngine.removeCharacter(id);
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
          walkingAnimationMapping: 0,
          startPosition: position,
        });
        scene.gridEngine
          .positionChangeFinished()
          .pipe(filter(({ charId }) => charId === id))
          .subscribe(({ exitTile }) => {
            position = exitTile;
          });
      }
    "
  />
</template>
