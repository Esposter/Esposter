<script setup lang="ts">
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { RoutePath } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const { executeMutation, isPending } = useMutation();
</script>

<template>
  <UiButton
    :is-pending
    :variant="UiButtonVariant.Accent"
    @click="
      executeMutation(() => $trpc.callSession.createCall.mutate(), {
        // The call's id is the server's to mint, and the way into the call waits for it
        awaitedBecause: AwaitedReason.ServerIssuedValue,
        key: Symbol('createCall'),
        onSuccess: async ({ callSessionId }) => {
          await navigateTo(RoutePath.Calls(callSessionId));
        },
      })
    "
  >
    <UiIcon v-if="!isPending" :meaning="UiIconMeaning.Camera" />
    New call
  </UiButton>
</template>
