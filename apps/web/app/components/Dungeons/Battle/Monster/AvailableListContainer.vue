<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { checkIsMonsterFainted } from "@/services/dungeons/monster/checkIsMonsterFainted";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { Container, Image, onCreate } from "vue-phaserjs";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { monsters } = storeToRefs(monsterPartySceneStore);
const x = ref<number>();
const isVisible = ref(false);

onCreate((scene) => {
  x.value = scene.scale.width - 24;
});

usePhaserListener("playerMonsterInfoContainerAppear", () => {
  isVisible.value = true;
});

onUnmounted(() => {
  isVisible.value = false;
});
</script>

<template>
  <Container :configuration="{ x, y: 304 }">
    <Image
      v-for="(monster, index) of monsters"
      :key="monster.id"
      :configuration="{
        visible: isVisible,
        x: -30 * index,
        texture: FileKey.UIBallsCosmoBall,
        scale: 0.8,
        alpha: checkIsMonsterFainted(monster) ? 0.4 : 1,
      }"
    />
  </Container>
</template>
