<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import TileSprite from "@/lib/phaser/components/TileSprite.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
</script>

<template>
  <Scene :scene-key="SceneKey.MonsterParty" :cls="SceneWithPlugins">
    <TileSprite
      :configuration="{
        width: scene.scale.width,
        height: scene.scale.height,
        texture: ImageKey.MonsterPartyBackground,
        origin: 0,
        alpha: 0.7,
      }"
    />
    <DungeonsJoystick />
    <DungeonsJoystickConfirmThumb />
  </Scene>
</template>
