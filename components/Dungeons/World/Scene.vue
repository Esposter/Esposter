<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { BEFORE_STOP_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SoundKey } from "@/models/dungeons/keys/SoundKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { dayjs } from "@/services/dayjs";
import { getAllInputResolvers } from "@/services/dungeons/world/getAllInputResolvers";
import { useGameStore } from "@/store/dungeons/game";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Cameras } from "phaser";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const cameraStore = useCameraStore();
const { fadeIn } = cameraStore;
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const worldSceneStore = useWorldSceneStore();
const { tilemap } = storeToRefs(worldSceneStore);
const worldDialogStore = useWorldDialogStore();
const { showMessages } = worldDialogStore;
const playerStore = usePlayerStore();
const { isPlayerFainted } = storeToRefs(playerStore);
const worldPlayerStore = useWorldPlayerStore();
const { respawn, healParty } = worldPlayerStore;
const inputResolvers = getAllInputResolvers();

const create = (scene: SceneWithPlugins) => {
  useDungeonsBackgroundMusic(SoundKey.AndTheJourneyBegins);

  if (isPlayerFainted.value) respawn();

  useCreateTilemap(TilemapKey.Home);
  useReadNpcList();
  scene.cameras.main.setBounds(0, 0, 1280, 2176);
  scene.cameras.main.setZoom(0.8);
  fadeIn(dayjs.duration(1, "second").asMilliseconds(), 0, 0, 0, (_camera: Cameras.Scene2D.Camera, progress: number) => {
    if (!(progress === 1 && isPlayerFainted.value)) return;

    healParty();
    showMessages([
      { title: "???", text: "It looks like your team put up quite a fight..." },
      { title: "???", text: "I went ahead and healed them up for you." },
    ]);
  });
};

const update = async (scene: SceneWithPlugins) => {
  const justDownInput = controls.value.getInput(true);
  const input = controls.value.getInput();

  for (const inputResolver of inputResolvers)
    if (await inputResolver.handleInputPre(justDownInput, input, scene)) return;

  for (const inputResolver of inputResolvers) if (await inputResolver.handleInput(justDownInput, input, scene)) return;
};

usePhaserListener(`${BEFORE_STOP_SCENE_EVENT_KEY}${SceneKey.World}`, () => {
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
