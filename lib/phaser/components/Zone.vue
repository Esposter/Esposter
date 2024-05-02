<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import type { ZoneConfiguration } from "@/lib/phaser/models/configuration/ZoneConfiguration";
import type { ZoneEventEmitsOptions } from "@/lib/phaser/models/emit/ZoneEventEmitsOptions";
import { ZoneSetterMap } from "@/lib/phaser/util/setterMap/ZoneSetterMap";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

interface ZoneProps {
  configuration: SetRequired<Partial<ZoneConfiguration>, "x" | "y" | "width" | "height">;
}

interface ZoneEmits extends /** @vue-ignore */ ZoneEventEmitsOptions {}

const props = defineProps<ZoneProps>();
const { configuration } = toRefs(props);
const { x, y, width, height } = configuration.value;
const emit = defineEmits<ZoneEmits>();
const scene = useInjectScene();
const zone = ref(scene.add.zone(x, y, width, height)) as Ref<GameObjects.Zone>;
useInitializeGameObject(zone, configuration, emit, ZoneSetterMap);
</script>

<template></template>
