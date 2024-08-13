<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { AssetKey } from "@/models/dungeons/keys/AssetKey";
import { isMonsterFainted } from "@/services/dungeons/monster/isMonsterFainted";
import { usePlayerStore } from "@/store/dungeons/player";

const playerStore = usePlayerStore();
const { player } = storeToRefs(playerStore);
const x = ref<number>();
const visible = ref(false);

onCreate((scene) => {
  x.value = scene.scale.width - 24;
});

usePhaserListener("playerMonsterInfoContainerAppear", () => {
  visible.value = true;
});

onUnmounted(() => {
  visible.value = false;
});
</script>

<template>
  <Container :configuration="{ x, y: 304 }">
    <Image
      v-for="(monster, index) in player.monsters"
      :key="monster.id"
      :configuration="{
        visible,
        x: -30 * index,
        texture: AssetKey.CosmoBall,
        scale: 0.8,
        alpha: isMonsterFainted(monster) ? 0.4 : 1,
      }"
    />
  </Container>
</template>
