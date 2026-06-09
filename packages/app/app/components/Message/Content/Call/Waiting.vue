<script setup lang="ts">
import { useKnockerStore } from "@/store/message/room/call/knocker";

const knockerStore = useKnockerStore();
const { cancelKnock } = knockerStore;
</script>

<template>
  <div p-6 bg-background flex size-full items-center justify-center>
    <StyledCard p-8 flex flex-col gap-y-6 max-w-md w-full items-center>
      <div rd-full bg-primary flex size-16 items-center justify-center>
        <v-progress-circular color="white" indeterminate size="36" />
      </div>
      <div text-center flex flex-col gap-y-2 items-center>
        <h2 font-medium text-headline-small>Waiting to be admitted</h2>
        <span op-medium-emphasis text-body-medium
          >Keep this window open. Someone in the call will let you in soon.</span
        >
      </div>
      <v-tooltip text="Cancel join request">
        <template #activator="{ props: tooltipProps }">
          <v-btn :="tooltipProps" text="Cancel request" variant="outlined" @click="cancelKnock()" />
        </template>
      </v-tooltip>
    </StyledCard>
  </div>
</template>
