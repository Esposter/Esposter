<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

interface WordFilterProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<WordFilterProps>();
const { $trpc } = useNuxtApp();
const words = ref<string[]>(await $trpc.roomFilter.readRoomFilter.query({ roomId }));
const newWord = ref("");
const save = async () => {
  await $trpc.roomFilter.updateRoomFilter.mutate({ roomId, words: words.value });
};
const addWord = () => {
  const trimmed = newWord.value.trim().toLowerCase();
  if (!trimmed || words.value.includes(trimmed)) return;
  words.value = [...words.value, trimmed];
  newWord.value = "";
  save();
};
const removeWord = (word: string) => {
  words.value = words.value.filter((w) => w !== word);
  save();
};
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div text-lg font-bold>Word Filter</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <div flex flex-col gap-2>
          <div font-semibold>Blocked Words</div>
          <v-text-field
            v-model="newWord"
            density="compact"
            hide-details="auto"
            placeholder="Add a word..."
            @keydown.enter.prevent="addWord()"
          >
            <template #append-inner>
              <v-btn icon="mdi-plus" size="x-small" variant="text" @click="addWord()" />
            </template>
          </v-text-field>
          <div v-if="words.length > 0" flex flex-wrap gap-2 mt-1>
            <v-chip v-for="word of words" :key="word" closable size="small" @click:close="removeWord(word)">
              {{ word }}
            </v-chip>
          </div>
          <span class="text-medium-emphasis" text-xs>
            Messages containing these words will be blocked. Comparisons are case-insensitive.
          </span>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
