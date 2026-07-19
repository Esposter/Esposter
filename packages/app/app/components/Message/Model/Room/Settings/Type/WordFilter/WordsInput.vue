<script setup lang="ts">
import { roomFilterWordSchema } from "#shared/models/db/room/RoomFilterWord";
import { FILTER_KEY_MAX_LENGTH, FILTER_WORDS_MAX_LENGTH } from "@esposter/db-schema";

const words = defineModel<string[]>({ required: true });
const rules = useVRules();
const newWord = ref("");
const isAtMaxWords = computed(() => words.value.length >= FILTER_WORDS_MAX_LENGTH);
const parsedNewWord = computed(() => roomFilterWordSchema.safeParse(newWord.value));
// The shared array schema rejects the whole save if two words normalize to the same value (e.g. case
// Variants), so block a normalized duplicate here rather than letting it fail at the boundary
const normalizedWords = computed(() => new Set(words.value.map((word) => roomFilterWordSchema.safeParse(word).data)));
const isNewWordValid = computed(
  () => parsedNewWord.value.success && !normalizedWords.value.has(parsedNewWord.value.data),
);
const createWord = () => {
  if (!isNewWordValid.value) return;
  words.value = [...words.value, newWord.value];
  newWord.value = "";
};
</script>

<template>
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
        <StyledTooltipIconButton
          :button-props="{ disabled: isAtMaxWords || !isNewWordValid, size: 'x-small', variant: 'plain' }"
          icon="mdi-plus"
          text="Add word"
          @click="createWord()"
        />
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
    <span text-hint> Messages containing these words will be blocked. Comparisons are case-insensitive. </span>
  </div>
</template>
