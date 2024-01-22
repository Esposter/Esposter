<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type TextConfiguration } from "@/lib/phaser/models/configuration/TextConfiguration";
import { type GameObjectEventEmitsOptions } from "@/lib/phaser/models/emit/GameObjectEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { TextSetterMap } from "@/lib/phaser/util/setterMap/TextSetterMap";

interface TextProps {
  configuration: TextConfiguration;
}

interface TextEmits extends /** @vue-ignore */ GameObjectEventEmitsOptions {}

const props = defineProps<TextProps>();
const { configuration } = toRefs(props);
const emit = defineEmits<TextEmits>();
const phaserStore = usePhaserStore();
const { gameObjectCreator } = storeToRefs(phaserStore);
useInitializeGameObject(
  (configuration) => gameObjectCreator.value.text(configuration),
  configuration,
  emit,
  TextSetterMap,
);
</script>
