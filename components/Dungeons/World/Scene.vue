<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { dayjs } from "@/services/dayjs";
import { useGameStore } from "@/store/dungeons/game";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const cameraStore = useCameraStore();
const { fadeIn } = cameraStore;
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const worldSceneStore = useWorldSceneStore();
const { tilemap } = storeToRefs(worldSceneStore);
const worldInputResolvers = useWorldInputResolvers();

const create = (scene: SceneWithPlugins) => {
  useCreateTilemap(TilemapKey.Home);
  useReadNpcList();
  scene.cameras.main.setBounds(0, 0, 1280, 2176);
  scene.cameras.main.setZoom(0.8);
  fadeIn(dayjs.duration(1, "second").asMilliseconds());
};

const update = async () => {
  const justDownInput = controls.value.getInput(true);
  const input = controls.value.getInput();

  for (const worldInputResolver of worldInputResolvers)
    if (await worldInputResolver.handleInputPre(justDownInput, input)) return;

  for (const worldInputResolver of worldInputResolvers)
    if (await worldInputResolver.handleInput(justDownInput, input)) return;
};

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${SceneKey.World}`, () => {
  tilemap.value.destroy();
  scene.value.cameras.main.removeBounds();
  scene.value.cameras.main.setZoom(1);
});
</script>

<template>
  <Scene :scene-key="SceneKey.World" :cls="SceneWithPlugins" @create="create" @update="update">
    <DungeonsWorldCharacterPlayer />
    <DungeonsWorldNpcList />
    <DungeonsWorldForeground />
    <DungeonsWorldDialog />
    <DungeonsWorldMenu />
  </Scene>
</template>
