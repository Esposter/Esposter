<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type TextConfiguration } from "@/lib/phaser/models/configuration/TextConfiguration";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { TextSetterMap } from "@/lib/phaser/util/setterMap/TextSetterMap";

interface TextProps {
  configuration: TextConfiguration;
}

const props = defineProps<TextProps>();
const { configuration } = toRefs(props);
const phaserStore = usePhaserStore();
const { gameObjectCreator } = storeToRefs(phaserStore);
useInitializeGameObject((configuration) => gameObjectCreator.value.text(configuration), configuration, TextSetterMap);
</script>
