<script setup lang="ts" generic="TName extends string, TScene extends Constructor<Scene>">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { type Constructor } from "@/util/types/Constructor";
import { type Scene } from "phaser";

interface SceneProps {
  name: TName;
  autoStart?: true;
  cls: TScene;
}

const { name, autoStart, cls } = defineProps<SceneProps>();
const emit = defineEmits<{
  init: [InstanceType<TScene>];
  preload: [InstanceType<TScene>];
  create: [InstanceType<TScene>];
  update: [InstanceType<TScene>, ...Parameters<InstanceType<TScene>["update"]>];
}>();
const phaserStore = usePhaserStore();
const { game, scene } = storeToRefs(phaserStore);
if (!game.value) throw new Error("Game has not been initialized");

const isShown = ref(false);
const NewScene = class extends cls {
  init(this: InstanceType<TScene>) {
    emit("init", this);
  }

  preload(this: InstanceType<TScene>) {
    emit("preload", this);
  }

  create(this: InstanceType<TScene>) {
    isShown.value = true;
    emit("create", this);
  }

  update(this: InstanceType<TScene>, ...args: Parameters<InstanceType<TScene>["update"]>) {
    emit("update", this, ...args);
  }
};
const newScene = game.value.scene.add(name, NewScene, autoStart);
if (!newScene) throw new Error(`New scene: "${name}" could not be created`);
newScene.events.on("shutdown", () => (isShown.value = false));
scene.value = newScene;
</script>

<template>
  <slot v-if="isShown" />
</template>
