<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { TimeoutDurationMap } from "@/services/message/moderation/TimeoutDurationMap";
import { FILTER_KEY_MAX_LENGTH, FILTER_WORDS_MAX_LENGTH, WordFilterAction } from "@esposter/db-schema";
import deepEqual from "fast-deep-equal";

interface WordFilterProps {
  room: RoomInMessage;
}

const { room } = defineProps<WordFilterProps>();
const { $trpc } = useNuxtApp();
const rules = useVRules();
const actionSelectItems = Object.values(WordFilterAction).map((value) => ({ title: value, value }));
const timeoutDurationSelectItems = Object.entries(TimeoutDurationMap).map(([title, value]) => ({ title, value }));
const defaultTimeoutDurationMs = TimeoutDurationMap["5 minutes"];
const initialWords = ref<string[]>([]);
const initialAction = ref<WordFilterAction>(WordFilterAction.Reject);
const initialTimeoutDurationMs = ref<number>(defaultTimeoutDurationMs);
const words = ref<string[]>([]);
const action = ref<WordFilterAction>(WordFilterAction.Reject);
const timeoutDurationMs = ref<number>(defaultTimeoutDurationMs);
useQuery(() => $trpc.room.filter.readRoomFilter.query({ roomId: room.id }), {
  onSuccess: (filter) => {
    initialWords.value = filter?.words ?? [];
    words.value = [...initialWords.value];
    initialAction.value = filter?.action ?? WordFilterAction.Reject;
    action.value = initialAction.value;
    initialTimeoutDurationMs.value = filter?.timeoutDurationMs ?? defaultTimeoutDurationMs;
    timeoutDurationMs.value = initialTimeoutDurationMs.value;
  },
});
const newWord = ref("");
const isTimeout = computed(() => action.value === WordFilterAction.Timeout);
const isDirty = computed(
  () =>
    !deepEqual(words.value, initialWords.value) ||
    action.value !== initialAction.value ||
    (isTimeout.value && timeoutDurationMs.value !== initialTimeoutDurationMs.value),
);
const isAtMaxWords = computed(() => words.value.length >= FILTER_WORDS_MAX_LENGTH);
const createWord = () => {
  words.value = [...words.value, newWord.value];
  newWord.value = "";
};
const executeMutation = useMutation();
const saveFilter = async () => {
  const previousInitial = {
    action: initialAction.value,
    timeoutDurationMs: initialTimeoutDurationMs.value,
    words: initialWords.value,
  };
  await executeMutation(
    () =>
      $trpc.room.filter.upsertRoomFilter.mutate({
        action: action.value,
        roomId: room.id,
        timeoutDurationMs: isTimeout.value ? timeoutDurationMs.value : null,
        words: words.value,
      }),
    {
      applyOptimistic: () => {
        initialWords.value = [...words.value];
        initialAction.value = action.value;
        initialTimeoutDurationMs.value = timeoutDurationMs.value;
        return () => {
          initialWords.value = previousInitial.words;
          initialAction.value = previousInitial.action;
          initialTimeoutDurationMs.value = previousInitial.timeoutDurationMs;
        };
      },
      onSuccess: (filter) => {
        initialWords.value = filter.words;
        words.value = [...filter.words];
        initialAction.value = filter.action;
        action.value = filter.action;
        if (filter.timeoutDurationMs !== null) {
          initialTimeoutDurationMs.value = filter.timeoutDurationMs;
          timeoutDurationMs.value = filter.timeoutDurationMs;
        }
      },
    },
  );
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
              <StyledTooltipIconButton
                :button-props="{ disabled: isAtMaxWords, size: 'x-small', variant: 'plain' }"
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
          <div mt-2 font-semibold>Action</div>
          <v-select v-model="action" :items="actionSelectItems" density="compact" hide-details label="On match" />
          <v-select
            v-if="isTimeout"
            v-model="timeoutDurationMs"
            :items="timeoutDurationSelectItems"
            density="compact"
            hide-details
            label="Timeout duration"
          />
          <span text-hint>
            Reject blocks the message. Warn and Timeout also record a moderation action against the sender.
          </span>
          <StyledButton
            :button-props="{ disabled: !isDirty, text: 'Save Changes', variant: 'tonal' }"
            @click="saveFilter"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
