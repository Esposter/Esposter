<script setup lang="ts">
import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { SceneComponentEntries } from "#src/services/dungeons/scene/SceneComponentMap";
import { checkIsMobile } from "#src/util/device/checkIsMobile";
import { AUTO, Scale } from "phaser";
import { Game, usePhaserStore, useTextStore } from "vue-phaserjs";

await useReadDungeons();

const phaserStore = usePhaserStore();
const { prioritizedParallelSceneKeys } = storeToRefs(phaserStore);
// Mobile joystick scene should always be the first to render
prioritizedParallelSceneKeys.value = [SceneKey.MobileJoystick];

const textStore = useTextStore();
const { defaultTextStyle } = storeToRefs(textStore);
// Phaser writes the family into the canvas font unquoted, and a lock key holds slashes and dots that the font parser
// Rejects
defaultTextStyle.value = { fontFamily: `"${DungeonsKeys.ThirdPartyKenneysAssetsFontsKenneyFutureNarrow}"` };
</script>

<template>
  <NuxtLayout is-viewport-height>
    <Game
      :configuration="{
        title: 'Dungeons',
        type: AUTO,
        scale: { width: 1024, height: 576, mode: Scale.ScaleModes.FIT, autoCenter: Scale.CENTER_BOTH },
        input: {
          keyboard: true,
          touch: true,
          // We need to support multi-touch for mobile joystick
          // https://phaser.discourse.group/t/how-to-enable-multitouch-jsfiddle-inside/2422
          activePointers: checkIsMobile() ? 3 : 2,
        },
      }"
    >
      <component :is="component" v-for="[sceneKey, component] of SceneComponentEntries" :key="sceneKey" />
    </Game>
  </NuxtLayout>
</template>
