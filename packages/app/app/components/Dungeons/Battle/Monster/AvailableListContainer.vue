<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { isMonsterFainted } from "@/services/dungeons/monster/isMonsterFainted";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { Container, Image, onCreate } from "vue-phaserjs";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { monsters } = storeToRefs(monsterPartySceneStore);
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
      v-for="(monster, index) of monsters"
      :key="monster.id"
      :configuration="{
        visible,
        x: -30 * index,
        texture: FileKey.UIBallsCosmoBall,
        scale: 0.8,
        alpha: isMonsterFainted(monster) ? 0.4 : 1,
      }"
    />
  </Container>
</template>
