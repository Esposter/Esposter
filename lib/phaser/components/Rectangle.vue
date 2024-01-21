<script setup lang="ts">
import { type RectangleConfiguration } from "@/lib/phaser/models/RectangleConfiguration";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { initializeGameObject } from "@/lib/phaser/util/initializeGameObject";
import { RectangleSetterMap } from "@/lib/phaser/util/setterMap/RectangleSetterMap";

interface RectangleProps {
  configuration: RectangleConfiguration;
}

const props = defineProps<RectangleProps>();
const { configuration } = toRefs(props);
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
initializeGameObject(
  ({ x, y, width, height, color, alpha }) => scene.value.add.rectangle(x, y, width, height, color, alpha),
  configuration,
  RectangleSetterMap,
);
</script>
