<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { VBtn } from "vuetify/components";

import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { withFinalizerAsync } from "@esposter/shared";

interface KnockerItemProps {
  knocker: CallParticipant;
}

const { knocker } = defineProps<KnockerItemProps>();
const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
const knockerStore = useKnockerStore();
const { admitKnocker, dismissKnocker } = knockerStore;
const isAdmitting = ref(false);
const isDismissing = ref(false);
const admitButtonProps = computed<VBtn["$props"]>(() => ({
  icon: "mdi-check",
  loading: isAdmitting.value,
  size: "small",
  variant: "tonal",
}));
const dismissButtonProps = computed<VBtn["$props"]>(() => ({
  loading: isDismissing.value,
  size: "small",
  variant: "plain",
}));
</script>

<template>
  <div flex gap-x-3 items-center>
    <StyledAvatar :image="knocker.image" :name="knocker.name" />
    <span font-medium flex-1 truncate text-body-medium>{{ knocker.name }} wants to join</span>
    <v-tooltip text="Let in">
      <template #activator="{ props: tooltipProps }">
        <StyledButton
          :="tooltipProps"
          :button-props="admitButtonProps"
          @click="
            async () => {
              const callSessionId = activeCallSessionId;
              if (!callSessionId) return;
              isAdmitting = true;
              await withFinalizerAsync(
                async () => {
                  await admitKnocker(callSessionId, knocker.id);
                },
                () => {
                  isAdmitting = false;
                },
              );
            }
          "
        />
      </template>
    </v-tooltip>
    <StyledTooltipIconButton
      :button-props="dismissButtonProps"
      icon="mdi-close"
      text="Dismiss"
      @click="
        async () => {
          const callSessionId = activeCallSessionId;
          if (!callSessionId) return;
          isDismissing = true;
          await withFinalizerAsync(
            async () => {
              await dismissKnocker(callSessionId, knocker.id);
            },
            () => {
              isDismissing = false;
            },
          );
        }
      "
    />
  </div>
</template>
