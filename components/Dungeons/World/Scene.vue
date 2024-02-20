<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { dayjs } from "@/services/dayjs";
import { isDirection } from "@/services/dungeons/input/isDirection";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useGameStore } from "@/store/dungeons/game";
import { useEncounterStore } from "@/store/dungeons/world/encounter";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const phaserStore = usePhaserStore();
const { scene, sceneKey } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const dialogStore = useDialogStore();
const { handleShowMessageInput } = dialogStore;
const worldSceneStore = useWorldSceneStore();
const { tilemap, isDialogVisible } = storeToRefs(worldSceneStore);
const playerStore = usePlayerStore();
const { isMoving } = storeToRefs(playerStore);
const encounterStore = useEncounterStore();
const { isMonsterEncountered } = storeToRefs(encounterStore);

const create = (scene: SceneWithPlugins) => {
  useCreateTilemap(TilemapKey.Home);
  useReadNpcList();
  scene.cameras.main.setBounds(0, 0, 1280, 2176);
  scene.cameras.main.setZoom(0.8);
  scene.cameras.main.fadeIn(dayjs.duration(1, "second").asMilliseconds());
};

const update = (scene: SceneWithPlugins) => {
  const input = controls.value.getInput();
  // We want to pause all other input whilst the dialog is visible
  if (isDialogVisible.value) {
    handleShowMessageInput(input);
    return;
  }

  useMoveNpcList();

  if (isMoving.value || isMonsterEncountered.value || !scene.gridEngine.hasCharacter(CharacterId.Player)) return;
  else if (input === PlayerSpecialInput.Confirm) useInteractions();
  else if (isDirection(input)) scene.gridEngine.move(CharacterId.Player, input);
};

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${sceneKey.value}`, () => {
  tilemap.value.destroy();
  scene.value.cameras.resetAll();
});
</script>

<template>
  <Scene :scene-key="SceneKey.World" :cls="SceneWithPlugins" @create="create" @update="update">
    <DungeonsWorldCharacterPlayer />
    <DungeonsWorldNpcList />
    <DungeonsWorldForeground />
    <DungeonsWorldDialog />
    <DungeonsJoystick />
    <DungeonsJoystickConfirmThumb />
  </Scene>
</template>
