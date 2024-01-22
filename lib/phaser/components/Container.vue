<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type ContainerConfiguration } from "@/lib/phaser/models/configuration/ContainerConfiguration";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ContainerSetterMap } from "@/lib/phaser/util/setterMap/ContainerSetterMap";

interface ContainerProps {
  configuration: ContainerConfiguration;
}

const props = defineProps<ContainerProps>();
const { configuration } = toRefs(props);
const phaserStore = usePhaserStore();
const { gameObjectCreator, parentContainer } = storeToRefs(phaserStore);
const container = useInitializeGameObject(
  (configuration) => gameObjectCreator.value.container(configuration),
  configuration,
  ContainerSetterMap,
);
parentContainer.value = container.value;
</script>
