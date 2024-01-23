<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type ImageConfiguration } from "@/lib/phaser/models/configuration/ImageConfiguration";
import { type GameObjectEventEmitsOptions } from "@/lib/phaser/models/emit/GameObjectEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { GAME_OBJECT_KEY } from "@/lib/phaser/util/constants";
import { ImageSetterMap } from "@/lib/phaser/util/setterMap/ImageSetterMap";

interface ImageProps {
  configuration: Partial<ImageConfiguration>;
}

interface ImageEmits extends /** @vue-ignore */ GameObjectEventEmitsOptions {}

const props = defineProps<ImageProps>();
const { configuration } = toRefs(props);
const emit = defineEmits<ImageEmits>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const image = useInitializeGameObject(
  ({ x, y, textureKey, frame }) => scene.value.add.image(x ?? 0, y ?? 0, textureKey ?? "", frame),
  configuration,
  emit,
  ImageSetterMap,
);
defineExpose({ [GAME_OBJECT_KEY]: image });
</script>
