<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageSetterMap } from "@/lib/phaser/util/setterMap/ImageSetterMap";
import { type Types } from "phaser";

interface ImageProps {
  configuration: Types.GameObjects.Sprite.SpriteConfig;
}

const props = defineProps<ImageProps>();
const { configuration } = toRefs(props);
const phaserStore = usePhaserStore();
const { gameObjectCreator } = storeToRefs(phaserStore);
useInitializeGameObject((configuration) => gameObjectCreator.value.image(configuration), configuration, ImageSetterMap);
</script>
