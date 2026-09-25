<script setup lang="ts">
import { CALL_ID_REGEX, selectCallSessionInMessageSchema } from "@esposter/db-schema";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

const callCodeOrLink = ref("");
const isJoining = ref(false);
// The regex finds the code wherever it sits in what was pasted, so the surrounding whitespace needs no trimming
const callId = computed(() => callCodeOrLink.value.match(CALL_ID_REGEX)?.[0] ?? "");
const isJoinable = computed(() => selectCallSessionInMessageSchema.shape.id.safeParse(callId.value).success);
</script>

<template>
  <UiForm
    flex
    gap-2
    items-end
    @submit="
      async () => {
        if (!isJoinable) return;
        isJoining = true;
        await withFinalizerAsync(
          async () => {
            await navigateTo(RoutePath.Calls(callId));
          },
          () => {
            isJoining = false;
          },
        );
      }
    "
  >
    <UiTextField v-model="callCodeOrLink" label="Enter a code or link" flex-1 min-w-0 />
    <UiButton :disabled="!isJoinable" :is-pending="isJoining" type="submit"> Join </UiButton>
  </UiForm>
</template>
