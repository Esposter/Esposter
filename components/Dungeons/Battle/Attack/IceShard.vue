<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
</script>

<template>
  <DungeonsBattleAttack
    :position="{ x: 745, y: 140 }"
    :spritesheet-key="SpritesheetKey.IceShard"
    :frame="5"
    :anims="{
      key: SpritesheetKey.IceShardStart,
      frames: scene.anims.generateFrameNumbers(SpritesheetKey.IceShardStart),
      frameRate: 8,
      repeat: 0,
      delay: 0,
    }"
    :play-animation-key="SpritesheetKey.IceShardStart"
  />
</template>
