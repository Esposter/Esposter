<script setup lang="ts" generic="TScene extends Constructor<Scene>">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { useInputStore } from "@/lib/phaser/store/phaser/input";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import type { Constructor } from "@/util/types/Constructor";
import type { Scene } from "phaser";
import { Cameras } from "phaser";

interface SceneProps {
  sceneKey: SceneKey;
  autoStart?: true;
  cls: TScene;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { sceneKey, autoStart, cls } = defineProps<SceneProps>();
const emit = defineEmits<{
  init: [InstanceType<TScene>];
  preload: [InstanceType<TScene>];
  create: [InstanceType<TScene>];
  update: [InstanceType<TScene>, ...Parameters<InstanceType<TScene>["update"]>];
}>();
const phaserStore = usePhaserStore();
const { isSameScene, switchToScene } = phaserStore;
const { game, scene, parallelSceneKeys } = storeToRefs(phaserStore);
const cameraStore = useCameraStore();
const { isFading } = storeToRefs(cameraStore);
const inputStore = useInputStore();
const { isActive: isInputActive } = storeToRefs(inputStore);
const isActive = computed(() => (scene.value && isSameScene(sceneKey)) || parallelSceneKeys.value.includes(sceneKey));
const NewScene = class extends cls {
  init(this: InstanceType<TScene>) {
    emit("init", this);
  }

  preload(this: InstanceType<TScene>) {
    emit("preload", this);
  }

  create(this: InstanceType<TScene>) {
    emit("create", this);
    if (!isInputActive.value) isInputActive.value = true;

    scene.value.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      isFading.value = false;
    });
    scene.value.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      isFading.value = false;
    });
  }

  update(this: InstanceType<TScene>, ...args: Parameters<InstanceType<TScene>["update"]>) {
    emit("update", this, ...args);
  }
};

onMounted(() => {
  if (!game.value) throw new NotInitializedError("Game");
  const newScene = game.value.scene.add(sceneKey, NewScene);
  if (!newScene) throw new Error(`New scene: "${sceneKey}" could not be created`);
  provide(InjectionKeyMap.Scene, newScene);

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
