<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type RectangleConfiguration } from "@/lib/phaser/models/configuration/RectangleConfiguration";
import { type GameObjectEventEmitsOptions } from "@/lib/phaser/models/emit/GameObjectEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { RectangleSetterMap } from "@/lib/phaser/util/setterMap/RectangleSetterMap";

interface RectangleProps {
  configuration: RectangleConfiguration;
}

const props = defineProps<RectangleProps>();
const { configuration } = toRefs(props);
const emit = defineEmits<GameObjectEventEmitsOptions>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
useInitializeGameObject(
  ({ x, y, width, height, fillColor, alpha }) => scene.value.add.rectangle(x, y, width, height, fillColor, alpha),
  configuration,
  emit,
  RectangleSetterMap,
);
</script>
