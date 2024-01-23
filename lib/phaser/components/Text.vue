<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type TextConfiguration } from "@/lib/phaser/models/configuration/TextConfiguration";
import { type GameObjectEventEmitsOptions } from "@/lib/phaser/models/emit/GameObjectEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { TextSetterMap } from "@/lib/phaser/util/setterMap/TextSetterMap";

interface TextProps {
  configuration: Partial<TextConfiguration>;
}

interface TextEmits extends /** @vue-ignore */ GameObjectEventEmitsOptions {}

const props = defineProps<TextProps>();
const { configuration } = toRefs(props);
const emit = defineEmits<TextEmits>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
useInitializeGameObject(
  ({ x, y, text, style }) => scene.value.add.text(x ?? 0, y ?? 0, text ?? "", style),
  configuration,
  emit,
  TextSetterMap,
);
</script>
