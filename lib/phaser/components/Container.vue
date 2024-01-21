<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { initializeGameObject } from "@/lib/phaser/util/initializeGameObject";
import { ContainerSetterMap } from "@/lib/phaser/util/setterMap/ContainerSetterMap";
import { type Types } from "phaser";

interface ContainerProps {
  configuration: Types.GameObjects.Container.ContainerConfig;
}

const props = defineProps<ContainerProps>();
const { configuration } = toRefs(props);
const phaserStore = usePhaserStore();
const { gameObjectCreator } = storeToRefs(phaserStore);
initializeGameObject(
  (configuration) => gameObjectCreator.value.container(configuration),
  configuration,
  ContainerSetterMap,
);
</script>
