<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type ImageConfiguration } from "@/lib/phaser/models/configuration/ImageConfiguration";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageSetterMap } from "@/lib/phaser/util/setterMap/ImageSetterMap";

interface ImageProps {
  configuration: ImageConfiguration;
}

const props = defineProps<ImageProps>();
const { configuration } = toRefs(props);
const phaserStore = usePhaserStore();
const { gameObjectCreator } = storeToRefs(phaserStore);
useInitializeGameObject((configuration) => gameObjectCreator.value.image(configuration), configuration, ImageSetterMap);
</script>
