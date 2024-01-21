<script setup lang="ts">
import { useWatchProps } from "@/lib/phaser/composables/useWatchProps";
import { type RectangleConfiguration } from "@/lib/phaser/models/RectangleConfiguration";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { RectangleSetterMap } from "@/lib/phaser/util/setterMap/RectangleSetterMap";

interface RectangleProps {
  configuration: RectangleConfiguration;
}

const props = defineProps<RectangleProps>();
const { configuration } = toRefs(props);
const { x, y, width, height, color, alpha } = configuration.value;
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const rectangle = scene.value.add.rectangle(x, y, width, height, color, alpha);

useWatchProps(rectangle, configuration, RectangleSetterMap);

onBeforeUnmount(() => {
  rectangle.destroy();
});
</script>
