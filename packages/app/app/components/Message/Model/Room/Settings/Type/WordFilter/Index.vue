<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { normalizeString } from "@esposter/shared";
import deepEqual from "fast-deep-equal";

interface WordFilterProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<WordFilterProps>();
const { $trpc } = useNuxtApp();
const initialWords = ref<string[]>(await $trpc.roomFilter.readRoomFilter.query({ roomId }));
const words = ref([...initialWords.value]);
const newWord = ref("");
const isDirty = computed(() => !deepEqual(words.value, initialWords.value));
const createWord = () => {
  const normalizedWord = normalizeString(newWord.value).toLowerCase();
  if (!normalizedWord || words.value.includes(normalizedWord)) return;
  words.value = [...words.value, normalizedWord];
  newWord.value = "";
};
const deleteWord = (word: string) => {
  words.value = words.value.filter((w) => w !== word);
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
            @keydown.enter.prevent="createWord()"
          >
            <template #append-inner>
              <v-btn icon="mdi-plus" size="x-small" variant="text" @click="createWord()" />
            </template>
          </v-text-field>
          <div v-if="words.length > 0" flex flex-wrap gap-2 mt-1>
            <v-chip v-for="word of words" :key="word" closable size="small" @click:close="deleteWord(word)">
              {{ word }}
            </v-chip>
          </div>
          <span class="text-medium-emphasis" text-xs>
            Messages containing these words will be blocked. Comparisons are case-insensitive.
          </span>
          <v-btn
            :disabled="!isDirty"
            color="primary"
            variant="tonal"
            @click="
              async () => {
                initialWords = (await $trpc.roomFilter.upsertRoomFilter.mutate({ roomId, words })).words;
              }
            "
          >
            Save Changes
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
