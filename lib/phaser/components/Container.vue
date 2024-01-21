<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ContainerSetterMap } from "@/lib/phaser/util/setterMap/ContainerSetterMap";
import { type Types } from "phaser";

interface ContainerProps {
  configuration: Types.GameObjects.Container.ContainerConfig;
}

const props = defineProps<ContainerProps>();
const { configuration } = toRefs(props);
const phaserStore = usePhaserStore();
const { gameObjectCreator } = storeToRefs(phaserStore);
useInitializeGameObject(
  (configuration) => gameObjectCreator.value.container(configuration),
  configuration,
  ContainerSetterMap,
);
</script>
