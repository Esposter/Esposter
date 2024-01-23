<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type ImageConfiguration } from "@/lib/phaser/models/configuration/ImageConfiguration";
import { type GameObjectEventEmitsOptions } from "@/lib/phaser/models/emit/GameObjectEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageSetterMap } from "@/lib/phaser/util/setterMap/ImageSetterMap";
import { type GameObjects } from "phaser";

interface ImageProps {
  configuration: Partial<ImageConfiguration>;
}

interface ImageEmits extends /** @vue-ignore */ GameObjectEventEmitsOptions {}

const props = defineProps<ImageProps>();
const { configuration } = toRefs(props);
const emit = defineEmits<ImageEmits>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
useInitializeGameObject(
  ({ x, y, textureKey, frame }) => scene.value.add.image(x ?? 0, y ?? 0, textureKey ?? "", frame),
  configuration,
  emit,
  ImageSetterMap as SetterMap<Partial<ImageConfiguration>, GameObjects.Image>,
);
</script>
