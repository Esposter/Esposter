<script setup lang="ts">
import { CALL_ID_REGEX, selectCallSessionInMessageSchema } from "@esposter/db-schema";
import { normalizeString, RoutePath, withFinalizerAsync } from "@esposter/shared";

const router = useRouter();
const callCodeOrLink = ref("");
const isJoining = ref(false);
const callId = computed(() => normalizeString(callCodeOrLink.value).match(CALL_ID_REGEX)?.[0] ?? "");
const canJoin = computed(() => selectCallSessionInMessageSchema.shape.id.safeParse(callId.value).success);
</script>

<template>
  <v-form
    flex
    flex-wrap
    gap-3
    items-center
    justify-center
    @submit.prevent="
      async () => {
        if (!canJoin) return;
        isJoining = true;
        await withFinalizerAsync(
          () => router.push(RoutePath.Calls(callId)),
          () => {
            isJoining = false;
          },
        );
      }
    "
  >
    <v-text-field
      v-model="callCodeOrLink"
      density="compact"
      label="Enter a code or link"
      prepend-inner-icon="mdi-keyboard"
      hide-details
      max-w-80
      min-w-72
    />
    <v-tooltip text="Join call">
      <template #activator="{ props }">
        <v-btn :="props" :disabled="!canJoin" :loading="isJoining" prepend-icon="mdi-login" text="Join" type="submit" />
      </template>
    </v-tooltip>
  </v-form>
</template>
