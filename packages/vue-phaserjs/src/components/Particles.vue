<script setup lang="ts">
import type { ParticlesConfiguration } from "@/models/configuration/ParticlesConfiguration";
import type { ParticlesEventEmitsOptions } from "@/models/emit/ParticlesEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { ParticlesSetterMap } from "@/util/setterMap/ParticlesSetterMap";

interface ParticlesEmits extends /** @vue-ignore */ ParticlesEventEmitsOptions {}

interface ParticlesProps {
  configuration: Partial<ParticlesConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, particles: GameObjects.Particles.ParticleEmitter) => void;
}

const { configuration, immediate, onComplete } = defineProps<ParticlesProps>();
const emit = defineEmits<ParticlesEmits>();

useInitializeGameObject(
  (scene) => {
    const { config, texture, x, y } = configuration;
    const particles = scene.add.particles(x ?? 0, y ?? 0, texture, config);
    onComplete?.(scene, particles);
    return particles;
  },
  () => configuration,
  emit,
  ParticlesSetterMap,
  immediate,
);
</script>

<template></template>
