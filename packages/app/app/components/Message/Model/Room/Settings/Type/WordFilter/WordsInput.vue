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
const newWordRules = computed(() => [rules.maxLength(FILTER_KEY_MAX_LENGTH)]);
const createWordButtonProps = computed(() => ({
  disabled: isAtMaxWords.value || !isNewWordValid.value,
  size: "x-small" as const,
  variant: "plain" as const,
}));
const createWord = () => {
  if (!isNewWordValid.value) return;
  words.value = [...words.value, newWord.value];
  newWord.value = "";
};
</script>

<template>
  <MessageModelRoomSettingsField
    hint="Messages containing these words will be blocked. Comparisons are case-insensitive."
    title="Blocked Words"
  >
    <v-text-field
      v-model="newWord"
      :disabled="isAtMaxWords"
      :rules="newWordRules"
      density="compact"
      placeholder="Add a word..."
      @keydown.enter.prevent="createWord()"
    >
      <template #append-inner>
        <StyledTooltipIconButton
          :button-props="createWordButtonProps"
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
        @click:close="words = words.filter((existingWord) => existingWord !== word)"
      >
        {{ word }}
      </v-chip>
    </div>
  </MessageModelRoomSettingsField>
</template>
