<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type ZoneConfiguration } from "@/lib/phaser/models/configuration/ZoneConfiguration";
import { type ZoneEventEmitsOptions } from "@/lib/phaser/models/emit/ZoneEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ZoneSetterMap } from "@/lib/phaser/util/setterMap/ZoneSetterMap";
import { type SetRequired } from "@/util/types/SetRequired";
import { type GameObjects } from "phaser";

interface ZoneProps {
  configuration: SetRequired<Partial<ZoneConfiguration>, "x" | "y" | "width" | "height">;
}

interface ZoneEmits extends /** @vue-ignore */ ZoneEventEmitsOptions {}

const props = defineProps<ZoneProps>();
const { configuration } = toRefs(props);
const { x, y, width, height } = configuration.value;
const emit = defineEmits<ZoneEmits>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const zone = ref(scene.value.add.zone(x, y, width, height)) as Ref<GameObjects.Zone>;
useInitializeGameObject(zone, configuration, emit, ZoneSetterMap);
</script>

<template></template>
