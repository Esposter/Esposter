<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
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
useInitializeGameObject((configuration) => gameObjectCreator.value.text(configuration), configuration, TextSetterMap);
</script>
