<script setup lang="ts">
import { LoadGame } from "@/models/dungeons/transitions/LoadGame";
import { StartGame } from "@/models/dungeons/transitions/StartGame";
import { useStateStore } from "@/store/dungeons/state";

const stateStore = useStateStore();
const { executeTransition } = stateStore;
</script>

<template>
  <v-container h-full>
    <v-row h-full>
      <v-col h-full flex flex-col items-center>
        <v-spacer />
        <div class="header" text-4xl>Dungeons</div>
        <v-spacer />
        <DungeonsButton icon="custom:dungeon-gate" text="New Game" @click="executeTransition(new StartGame())" />
        <DungeonsButton mt-4 icon="custom:load" text="Load Game" @click="executeTransition(new LoadGame())" />
        <v-spacer flex-grow-5="!" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.button {
  width: 11rem;
}
</style>
