<script setup lang="ts">
import { MAX_SNAPSHOT_LABEL_LENGTH } from "#shared/services/resource/constants";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";
import { withFinalizerAsync } from "@esposter/shared";

const modelValue = defineModel<boolean>({ default: false });
const versionHistoryStore = useVersionHistoryStore();
const { saveResourceRevision } = versionHistoryStore;
const rules = useVRules();
// The label names a point in this resource's history — what the owner was at, rather than what changed — so it
// Is optional: an unnamed version still says when it was taken and what it holds
const label = ref("");
</script>

<template>
  <StyledFormDialog
    v-model="modelValue"
    :card-props="{ title: 'Save version' }"
    :confirm-button-props="{ text: 'Save' }"
    @submit="
      async (_event, onComplete) => {
        await withFinalizerAsync(() => saveResourceRevision(undefined, label), onComplete);
      }
    "
  >
    <v-text-field
      v-model="label"
      autofocus
      :counter="MAX_SNAPSHOT_LABEL_LENGTH"
      hint="Optional — what this point in the resource's history is"
      label="Label"
      :rules="[rules.maxLength(MAX_SNAPSHOT_LABEL_LENGTH)]"
    />
  </StyledFormDialog>
</template>
