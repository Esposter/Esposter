<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { initializeGameObject } from "@/lib/phaser/util/initializeGameObject";
import { ImageSetterMap } from "@/lib/phaser/util/setterMap/ImageSetterMap";
import { type Types } from "phaser";

interface ImageProps {
  configuration: Types.GameObjects.Sprite.SpriteConfig;
}

const props = defineProps<ImageProps>();
const { configuration } = toRefs(props);
const phaserStore = usePhaserStore();
const { gameObjectCreator } = storeToRefs(phaserStore);
initializeGameObject((configuration) => gameObjectCreator.value.image(configuration), configuration, ImageSetterMap);
</script>
