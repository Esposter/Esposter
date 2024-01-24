<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type ImageConfiguration } from "@/lib/phaser/models/configuration/ImageConfiguration";
import { type ImageEventEmitsOptions } from "@/lib/phaser/models/emit/ImageEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageSetterMap } from "@/lib/phaser/util/setterMap/ImageSetterMap";
import { type SetRequired } from "@/util/types/SetRequired";

interface ImageProps {
  configuration: SetRequired<Partial<ImageConfiguration>, "textureKey">;
}

interface ImageEmits extends /** @vue-ignore */ ImageEventEmitsOptions {}

const props = defineProps<ImageProps>();
const { configuration } = toRefs(props);
const emit = defineEmits<ImageEmits>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
useInitializeGameObject(
  ({ x, y, textureKey, frame }) => scene.value.add.image(x ?? 0, y ?? 0, textureKey, frame),
  configuration,
  emit,
  ImageSetterMap,
);
</script>
