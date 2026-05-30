<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { formRules } from "@/services/vuetify/formRules";
import { FILTER_KEY_MAX_LENGTH, FILTER_WORDS_MAX_LENGTH } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";
import deepEqual from "fast-deep-equal";

interface WordFilterProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<WordFilterProps>();
const { $trpc } = useNuxtApp();
const initialWords = ref<string[]>(await $trpc.room.filter.readRoomFilter.query({ roomId }));
const words = ref([...initialWords.value]);
const newWord = ref("");
const isDirty = computed(() => !deepEqual(words.value, initialWords.value));
const isAtMaxWords = computed(() => words.value.length >= FILTER_WORDS_MAX_LENGTH);
const createWord = () => {
  if (isAtMaxWords.value) return;
  const normalizedWord = normalizeString(newWord.value).toLowerCase();
  if (!normalizedWord || words.value.includes(normalizedWord)) return;
  words.value = [...words.value, normalizedWord];
  newWord.value = "";
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
            :disabled="isAtMaxWords"
            :rules="[formRules.requireAtMostNCharacters(FILTER_KEY_MAX_LENGTH)]"
            density="compact"
            placeholder="Add a word..."
            @keydown.enter.prevent="createWord()"
          >
            <template #append-inner>
              <v-btn :disabled="isAtMaxWords" icon="mdi-plus" size="x-small" variant="text" @click="createWord()" />
            </template>
          </v-text-field>
          <div v-if="words.length > 0" mt-1 flex flex-wrap gap-2>
            <v-chip
              v-for="word of words"
              :key="word"
              closable
              size="small"
              @click:close="words = words.filter((w) => w !== word)"
            >
              {{ word }}
            </v-chip>
          </div>
          <span text-xs op-medium-emphasis>
            Messages containing these words will be blocked. Comparisons are case-insensitive.
          </span>
          <StyledButton
            :button-props="{ disabled: !isDirty, text: 'Save Changes', variant: 'tonal' }"
            @click="
              async () => {
                initialWords = (await $trpc.room.filter.upsertRoomFilter.mutate({ roomId, words })).words;
              }
            "
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
