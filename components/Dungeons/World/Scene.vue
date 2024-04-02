<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { dayjs } from "@/services/dayjs";
import { isMovingDirection } from "@/services/dungeons/input/isMovingDirection";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useGameStore } from "@/store/dungeons/game";
import { useWorldMenuStore } from "@/store/dungeons/world/menu";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const cameraStore = useCameraStore();
const { fadeIn } = cameraStore;
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const dialogStore = useDialogStore();
const { handleShowMessageInput } = dialogStore;
const worldSceneStore = useWorldSceneStore();
const { tilemap, isDialogVisible, isMenuVisible } = storeToRefs(worldSceneStore);
const worldMenuStore = useWorldMenuStore();
const { onPlayerInput: onMenuPlayerInput } = worldMenuStore;
const playerStore = usePlayerStore();
const { isMoving } = storeToRefs(playerStore);

const create = (scene: SceneWithPlugins) => {
  useCreateTilemap(TilemapKey.Home);
  useReadNpcList();
  scene.cameras.main.setBounds(0, 0, 1280, 2176);
  scene.cameras.main.setZoom(0.8);
  fadeIn(dayjs.duration(1, "second").asMilliseconds());
};

const update = (scene: SceneWithPlugins) => {
  const justDownInput = controls.value.getInput(true);
  const input = controls.value.getInput();
  // We want to pause all other input whilst the dialog/menus are visible
  if (isDialogVisible.value) {
    handleShowMessageInput(justDownInput);
    return;
  } else if (isMenuVisible.value) {
    onMenuPlayerInput(justDownInput);
    return;
  }

  useMoveNpcList();

  if (isMoving.value || !scene.gridEngine.hasCharacter(CharacterId.Player)) return;
  else if (justDownInput === PlayerSpecialInput.Confirm) useInteractions();
  else if (isMovingDirection(input)) scene.gridEngine.move(CharacterId.Player, input);
  else if (justDownInput === PlayerSpecialInput.Enter) isMenuVisible.value = true;
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
