<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type ContainerConfiguration } from "@/lib/phaser/models/configuration/ContainerConfiguration";
import { type GameObjectEventEmitsOptions } from "@/lib/phaser/models/emit/GameObjectEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ContainerSetterMap } from "@/lib/phaser/util/setterMap/ContainerSetterMap";
import { type GameObjects } from "phaser";

interface ContainerProps {
  configuration: Partial<ContainerConfiguration>;
}

interface ContainerEmits extends /** @vue-ignore */ GameObjectEventEmitsOptions {}

const props = defineProps<ContainerProps>();
const { configuration } = toRefs(props);
const emit = defineEmits<ContainerEmits>();
const phaserStore = usePhaserStore();
const { scene, parentContainer } = storeToRefs(phaserStore);
const container = useInitializeGameObject(
  ({ x, y, children }) => scene.value.add.container(x, y, children),
  configuration,
  emit,
  ContainerSetterMap as SetterMap<Partial<ContainerConfiguration>, GameObjects.Container>,
);
parentContainer.value = container.value;
</script>
