<script setup lang="ts" generic="TKey extends string, TScene extends Constructor<Scene>">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { type Constructor } from "@/util/types/Constructor";
import { type Scene } from "phaser";

interface SceneProps {
  sceneKey: TKey;
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
const { game, sceneKey: sceneKeyStore } = storeToRefs(phaserStore);

const isShutdown = ref(true);
const NewScene = class extends cls {
  init(this: InstanceType<TScene>) {
    emit("init", this);
  }

  preload(this: InstanceType<TScene>) {
    emit("preload", this);
  }

  create(this: InstanceType<TScene>) {
    emit("create", this);
  }

  update(this: InstanceType<TScene>, ...args: Parameters<InstanceType<TScene>["update"]>) {
    emit("update", this, ...args);
  }
};

onMounted(() => {
  if (!game.value) throw new Error("Game has not been initialized");

  const newScene = game.value.scene.add(sceneKey, NewScene);
  if (!newScene) throw new Error(`New scene: "${sceneKey}" could not be created`);
  newScene.events.on("shutdown", () => (isShutdown.value = false));

  if (autoStart) sceneKeyStore.value = sceneKey;
});

onUnmounted(() => {
  if (!game.value) throw new Error("Game has not been initialized");

  game.value.scene.remove(sceneKey);
});
</script>

<template>
  <slot v-if="sceneKey === sceneKeyStore && !isShutdown" />
</template>
