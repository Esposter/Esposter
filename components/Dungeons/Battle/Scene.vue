<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { AttackId } from "@/models/dungeons/attack/AttackId";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { SceneWithPlugins } from "@/models/dungeons/scenes/plugins/SceneWithPlugins";
</script>

<template>
  <Scene :scene-key="SceneKey.Battle" :cls="SceneWithPlugins">
    <DungeonsBattleBackground />
    <DungeonsBattleMonster
      :monster="{
        name: TextureManagerKey.Carnodusk,
        asset: {
          key: TextureManagerKey.Carnodusk,
        },
        stats: {
          maxHp: 25,
          baseAttack: 5,
        },
        currentLevel: 5,
        currentHp: 25,
        attackIds: [AttackId.IceShard],
      }"
      is-enemy
    />
    <DungeonsBattleMonster
      :monster="{
        name: TextureManagerKey.Iguanignite,
        asset: {
          key: TextureManagerKey.Iguanignite,
        },
        stats: {
          maxHp: 25,
          baseAttack: 5,
        },
        currentLevel: 5,
        currentHp: 25,
        attackIds: [AttackId.Slash],
      }"
    />
  </Scene>
</template>
