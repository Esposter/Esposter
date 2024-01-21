<script setup lang="ts">
import { useWatchProps } from "@/lib/phaser/composables/useWatchProps";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { TextSetterMap } from "@/lib/phaser/util/setterMap/TextSetterMap";
import { type Types } from "phaser";

interface TextProps {
  configuration: Types.GameObjects.Text.TextConfig;
}

const props = defineProps<TextProps>();
const { configuration } = toRefs(props);
const phaserStore = usePhaserStore();
const { gameObjectCreator } = storeToRefs(phaserStore);
const text = gameObjectCreator.value.text(configuration.value);

useWatchProps(text, configuration, TextSetterMap);

onBeforeUnmount(() => {
  text.destroy();
});
</script>
