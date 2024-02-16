<script setup lang="ts" generic="TScene extends Constructor<Scene>">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { type SceneKey } from "@/models/dungeons/keys/SceneKey";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import { type Constructor } from "@/util/types/Constructor";
import { type Scene } from "phaser";

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
const { game, scene } = storeToRefs(phaserStore);

const isShown = computed(() => scene.value && isSameScene(sceneKey));
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
  if (!game.value) throw new NotInitializedError("Game");
  const newScene = game.value.scene.add(sceneKey, NewScene);
  if (!newScene) throw new Error(`New scene: "${sceneKey}" could not be created`);

  if (autoStart) switchToScene(sceneKey);
});

onUnmounted(() => {
  if (!game.value) throw new NotInitializedError("Game");
  game.value.scene.remove(sceneKey);
});
</script>

<template>
  <slot v-if="isShown" />
</template>
