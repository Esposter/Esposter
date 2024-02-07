<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";

const isActive = defineModel<boolean>("isActive", { required: true });
const emit = defineEmits<{ complete: [] }>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const playAnimationKey = usePlayAnimation(SpritesheetKey.Slash, isActive, emit);
</script>

<template>
  <Container :configuration="{ x: 745, y: 140, visible: isActive }">
    <DungeonsBattleAttack
      v-model:is-active="isActive"
      :spritesheet-key="SpritesheetKey.Slash"
      :animations="[
        {
          key: SpritesheetKey.Slash,
          frames: scene.anims.generateFrameNumbers(SpritesheetKey.Slash),
          frameRate: 4,
          repeat: 0,
          delay: 0,
        },
      ]"
      :play-animation-key="playAnimationKey"
    />
    <DungeonsBattleAttack
      v-model:is-active="isActive"
      :position="{ x: 30 }"
      :spritesheet-key="SpritesheetKey.Slash"
      :play-animation-key="playAnimationKey"
    />
    <DungeonsBattleAttack
      v-model:is-active="isActive"
      :position="{ x: -30 }"
      :spritesheet-key="SpritesheetKey.Slash"
      :play-animation-key="playAnimationKey"
    />
  </Container>
</template>
