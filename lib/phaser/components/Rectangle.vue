<script setup lang="ts">
import { type RectangleConfiguration } from "@/lib/phaser/models/configuration/RectangleConfiguration";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { initializeGameObject } from "@/lib/phaser/util/initializeGameObject";
import { RectangleSetterMap } from "@/lib/phaser/util/setterMap/RectangleSetterMap";
import { type GameObjects } from "phaser";

interface RectangleProps {
  configuration: RectangleConfiguration;
}

const props = defineProps<RectangleProps>();
const { configuration } = toRefs(props);
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
initializeGameObject<RectangleConfiguration, GameObjects.Rectangle>(
  ({ x, y, width, height, fillColor, alpha }) => scene.value.add.rectangle(x, y, width, height, fillColor, alpha),
  configuration,
  RectangleSetterMap,
);
</script>
