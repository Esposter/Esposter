<script setup lang="ts">
import { MessageDisplayMode } from "@/models/message/MessageDisplayMode";
import { useAppearanceStore } from "@/store/message/ui/appearance";

const appearanceStore = useAppearanceStore();
const { messageDisplayMode } = storeToRefs(appearanceStore);
</script>

<template>
  <v-radio-group v-model="messageDisplayMode">
    <v-radio :value="MessageDisplayMode.Cozy">
      <template #label>
        <div flex flex-col>
          <span>{{ MessageDisplayMode.Cozy }}</span>
          <span text-hint>Modern, beautiful, and easy on your eyes.</span>
        </div>
      </template>
    </v-radio>
    <v-radio :value="MessageDisplayMode.Compact">
      <template #label>
        <div flex flex-col>
          <span>{{ MessageDisplayMode.Compact }}</span>
          <span text-hint>Fit more messages on screen at one time.</span>
        </div>
      </template>
    </v-radio>
  </v-radio-group>
</template>
