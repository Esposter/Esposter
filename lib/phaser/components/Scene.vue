<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { useInputStore } from "@/lib/phaser/store/phaser/input";
import { useSceneStore } from "@/lib/phaser/store/phaser/scene";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import { Cameras, Scenes } from "phaser";

interface SceneProps {
  sceneKey: SceneKey;
  autoStart?: true;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { sceneKey, autoStart } = defineProps<SceneProps>();
const emit = defineEmits<{
  init: [SceneWithPlugins];
  preload: [SceneWithPlugins];
  create: [SceneWithPlugins];
  update: [SceneWithPlugins, ...Parameters<SceneWithPlugins["update"]>];
}>();
const phaserStore = usePhaserStore();
const { isSameScene, switchToScene } = phaserStore;
const { game, scene, parallelSceneKeys } = storeToRefs(phaserStore);
const sceneStore = useSceneStore();
const { stopListeners } = storeToRefs(sceneStore);
const cameraStore = useCameraStore();
const { isFading } = storeToRefs(cameraStore);
const inputStore = useInputStore();
const { isActive: isInputActive } = storeToRefs(inputStore);
const isActive = computed(() => (scene.value && isSameScene(sceneKey)) || parallelSceneKeys.value.includes(sceneKey));
const NewScene = class extends SceneWithPlugins {
  init(this: SceneWithPlugins) {
    emit("init", this);
  }

  preload(this: SceneWithPlugins) {
    emit("preload", this);
  }

  create(this: SceneWithPlugins) {
    emit("create", this);
    if (!isInputActive.value) isInputActive.value = true;

    scene.value.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      isFading.value = false;
    });
    scene.value.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      isFading.value = false;
    });
  }

  update(this: SceneWithPlugins, ...args: Parameters<SceneWithPlugins["update"]>) {
    emit("update", this, ...args);
  }
};

onMounted(() => {
  if (!game.value) throw new NotInitializedError("Game");
  const newScene = game.value.scene.add(sceneKey, NewScene);
  if (!newScene) throw new Error(`New scene: "${sceneKey}" could not be created`);
  provide(InjectionKeyMap.Scene, newScene);
  newScene.events.once(Scenes.Events.SHUTDOWN, () => {
    for (const stopListener of stopListeners.value) stopListener(newScene as SceneWithPlugins);
    stopListeners.value = [];
  });

  if (autoStart) switchToScene(sceneKey);
});

onUnmounted(() => {
  if (!game.value) throw new NotInitializedError("Game");
  game.value.scene.remove(sceneKey);
});
</script>

<template>
  <slot v-if="isActive" />
</template>
