<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { useInputStore } from "@/lib/phaser/store/phaser/input";
import { useSceneStore } from "@/lib/phaser/store/phaser/scene";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import { GameObjectType } from "@/models/error/dungeons/GameObjectType";
import { Operation } from "@/models/shared/Operation";
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
  shutdown: [SceneWithPlugins];
}>();
const phaserStore = usePhaserStore();
const { isSameScene, switchToScene } = phaserStore;
const { game, parallelSceneKeys } = storeToRefs(phaserStore);
const sceneStore = useSceneStore();
const { preloadListenersMap, createListenersMap, shutdownListenersMap } = storeToRefs(sceneStore);
const cameraStore = useCameraStore();
const { isFading } = storeToRefs(cameraStore);
const inputStore = useInputStore();
const { isActive: isInputActive } = storeToRefs(inputStore);
const isActive = computed(() => isSameScene(sceneKey) || parallelSceneKeys.value.includes(sceneKey));
let newScene: SceneWithPlugins | null = null;
const NewScene = class extends SceneWithPlugins {
  init(this: SceneWithPlugins) {
    emit("init", this);
  }

  preload(this: SceneWithPlugins) {
    if (!newScene) throw new NotInitializedError(GameObjectType.Scene);

    emit("preload", this);

    for (const preloadListener of preloadListenersMap.value[sceneKey]) preloadListener(newScene);
    preloadListenersMap.value[sceneKey] = [];
  }

  create(this: SceneWithPlugins) {
    if (!newScene) throw new NotInitializedError(GameObjectType.Scene);

    emit("create", this);
    if (!isInputActive.value) isInputActive.value = true;

    newScene.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      isFading.value = false;
    });
    newScene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      isFading.value = false;
    });

    for (const createListener of createListenersMap.value[sceneKey]) createListener(newScene);
    createListenersMap.value[sceneKey] = [];
  }

  update(this: SceneWithPlugins, ...args: Parameters<SceneWithPlugins["update"]>) {
    emit("update", this, ...args);
  }
};

const shutdownListener = () => {
  if (!newScene) throw new NotInitializedError(GameObjectType.Scene);
  for (const shutdownListener of shutdownListenersMap.value[sceneKey]) shutdownListener(newScene);
  shutdownListenersMap.value[sceneKey] = [];
  emit("shutdown", newScene);
};

onMounted(() => {
  if (!game.value) throw new NotInitializedError(GameObjectType.Game);
  newScene = game.value.scene.add(sceneKey, NewScene) as SceneWithPlugins | null;
  if (!newScene) throw new InvalidOperationError(Operation.Create, GameObjectType.Scene, `key: ${sceneKey}`);
  provide(InjectionKeyMap.Scene, newScene);
  newScene.events.on(Scenes.Events.SHUTDOWN, shutdownListener);

  if (autoStart) switchToScene(sceneKey);
});

onUnmounted(() => {
  if (!game.value) throw new NotInitializedError(GameObjectType.Game);
  else if (!newScene) throw new NotInitializedError(GameObjectType.Scene);
  newScene.events.off(Scenes.Events.SHUTDOWN, shutdownListener);
  game.value.scene.remove(sceneKey);
});
</script>

<template>
  <slot v-if="isActive" />
</template>
