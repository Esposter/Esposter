<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { initializeGameObject } from "@/lib/phaser/util/initializeGameObject";
import { TextSetterMap } from "@/lib/phaser/util/setterMap/TextSetterMap";
import { type Types } from "phaser";

interface TextProps {
  configuration: Types.GameObjects.Text.TextConfig;
}

const props = defineProps<TextProps>();
const { configuration } = toRefs(props);
const phaserStore = usePhaserStore();
const { gameObjectCreator } = storeToRefs(phaserStore);
initializeGameObject((configuration) => gameObjectCreator.value.text(configuration), configuration, TextSetterMap);
</script>
