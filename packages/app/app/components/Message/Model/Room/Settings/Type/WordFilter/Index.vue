<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { FILTER_KEY_MAX_LENGTH, FILTER_WORDS_MAX_LENGTH } from "@esposter/db-schema";
import deepEqual from "fast-deep-equal";

interface WordFilterProps {
  room: RoomInMessage;
}

const { room } = defineProps<WordFilterProps>();
const rules = useVRules();
const { $trpc } = useNuxtApp();
const initialWords = ref<string[]>(await $trpc.room.filter.readRoomFilter.query({ roomId: room.id }));
const words = ref([...initialWords.value]);
const newWord = ref("");
const isDirty = computed(() => !deepEqual(words.value, initialWords.value));
const isAtMaxWords = computed(() => words.value.length >= FILTER_WORDS_MAX_LENGTH);
const createWord = () => {
  words.value = [...words.value, newWord.value];
  newWord.value = "";
};
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div font-bold text-title-medium>Word Filter</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <div flex flex-col gap-2>
          <div font-semibold>Blocked Words</div>
          <v-text-field
            v-model="newWord"
            :disabled="isAtMaxWords"
            :rules="[rules.maxLength(FILTER_KEY_MAX_LENGTH)]"
            density="compact"
            placeholder="Add a word..."
            @keydown.enter.prevent="createWord()"
          >
            <template #append-inner>
              <v-tooltip text="Add word">
                <template #activator="{ props: tooltipProps }">
                  <v-btn
                    :="tooltipProps"
                    :disabled="isAtMaxWords"
                    icon="mdi-plus"
                    size="x-small"
                    variant="plain"
                    @click="createWord()"
                  />
                </template>
              </v-tooltip>
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
          <span op-medium-emphasis text-body-small>
            Messages containing these words will be blocked. Comparisons are case-insensitive.
          </span>
          <StyledButton
            :button-props="{ disabled: !isDirty, text: 'Save Changes', variant: 'tonal' }"
            @click="
              async () => {
                words = initialWords = (await $trpc.room.filter.upsertRoomFilter.mutate({ roomId: room.id, words }))
                  .words;
              }
            "
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
