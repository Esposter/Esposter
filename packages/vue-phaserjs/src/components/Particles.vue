<script setup lang="ts">
import type { ParticlesConfiguration } from "#src/models/configuration/ParticlesConfiguration";
import type { ParticlesEventEmitsOptions } from "#src/models/emit/ParticlesEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { UndefinedOnPartial } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { ParticlesSetterMap } from "#src/services/setterMap/ParticlesSetterMap";

interface ParticlesEmits extends /** @vue-ignore */ ParticlesEventEmitsOptions {}

interface Props {
  configuration: UndefinedOnPartial<Partial<ParticlesConfiguration>>;
  immediate?: true | undefined;
  onComplete?: ((scene: SceneWithPlugins, particles: GameObjects.Particles.ParticleEmitter) => void) | undefined;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
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
