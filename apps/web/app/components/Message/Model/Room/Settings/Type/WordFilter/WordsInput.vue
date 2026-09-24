<script setup lang="ts">
import { roomFilterWordSchema } from "#shared/models/db/room/RoomFilterWord";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
const createWord = () => {
  if (isAtMaxWords.value || !isNewWordValid.value) return;
  words.value = [...words.value, newWord.value];
  newWord.value = "";
};
</script>

<template>
  <MessageModelRoomSettingsField
    hint="Messages containing these words will be blocked. Comparisons are case-insensitive."
    title="Blocked words"
  >
    <div flex gap-2 items-start>
      <UiTextField
        v-model="newWord"
        is-label-hidden
        label="Add a blocked word"
        placeholder="Add a word..."
        :rules="newWordRules"
        flex-1
        min-w-0
        @keydown.enter.prevent="createWord()"
      />
      <UiIconButton
        :disabled="isAtMaxWords || !isNewWordValid"
        label="Add word"
        :meaning="UiIconMeaning.Create"
        @click="createWord()"
      />
    </div>
    <!-- Each word is the button that takes it off the list, so the mark on it says what pressing it does -->
    <div v-if="words.length > 0" flex flex-wrap gap-2>
      <UiButton
        v-for="word of words"
        :key="word"
        :aria-label="`Remove ${word}`"
        :variant="UiButtonVariant.Field"
        @click="words = words.filter((existingWord) => existingWord !== word)"
      >
        {{ word }}
        <UiIcon :meaning="UiIconMeaning.Remove" text-muted />
      </UiButton>
    </div>
  </MessageModelRoomSettingsField>
</template>
