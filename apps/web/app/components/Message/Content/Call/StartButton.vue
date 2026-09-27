<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
        key: Symbol('createCall'),
        onSuccess: ({ callSessionId }) => navigateTo(RoutePath.Calls(callSessionId)),
      })
    "
  >
    <UiIcon v-if="!isPending" :meaning="UiIconMeaning.Camera" />
    New call
  </UiButton>
</template>
