<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { ZoneConfiguration } from "@/lib/phaser/models/configuration/ZoneConfiguration";
import type { ZoneEventEmitsOptions } from "@/lib/phaser/models/emit/ZoneEventEmitsOptions";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { ZoneSetterMap } from "@/lib/phaser/util/setterMap/ZoneSetterMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import type { SetRequired } from "@/util/types/SetRequired";
import type { GameObjects } from "phaser";

interface ZoneProps {
  configuration: SetRequired<Partial<ZoneConfiguration>, "x" | "y" | "width" | "height">;
}

interface ZoneEmits extends /** @vue-ignore */ ZoneEventEmitsOptions {}

const props = defineProps<ZoneProps>();
const { configuration } = toRefs(props);
const { x, y, width, height } = configuration.value;
const emit = defineEmits<ZoneEmits>();
const scene = inject<SceneWithPlugins>(InjectionKeyMap.Scene);
if (!scene) throw new NotInitializedError("Scene");

const zone = ref(scene.add.zone(x, y, width, height)) as Ref<GameObjects.Zone>;
useInitializeGameObject(zone, configuration, emit, ZoneSetterMap);
</script>

<template></template>
