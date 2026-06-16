<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";

import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { withFinalizerAsync } from "@esposter/shared";

interface PreJoinProps {
  callId: string;
  isCreator: boolean;
}

const { callId, isCreator } = defineProps<PreJoinProps>();
const callStore = useCallStore();
const { joinCall } = callStore;
const knockerStore = useKnockerStore();
const { knockCall } = knockerStore;
const isRequestingJoin = ref(false);
const joinButtonText = computed(() => (isCreator ? "Join now" : "Request to join"));
const joinHint = computed(() =>
  isCreator ? "Start the call when you're ready." : "You'll wait in the ready room until someone admits you.",
);
const { cameraStream, isCameraEnabled, isMicrophoneEnabled, toggleCamera, toggleMicrophone } = useCallPreJoinMedia();
const mediaControls = useTemplateRef<ComponentPublicInstance>("mediaControls");
const { height: mediaControlsHeight } = useElementSize(mediaControls);
</script>

<template>
  <div p-6 bg-background flex flex-col gap-4 size-full overflow-y-auto lg:flex-row>
    <div flex flex-1 flex-col gap-y-4 min-h-0 min-w-0>
      <MessageContentCallPreJoinCameraPreview flex-1 min-h-0 :is-camera-enabled :stream="cameraStream" />
      <MessageContentCallPreJoinMediaControls
        ref="mediaControls"
        :is-camera-enabled
        :is-microphone-enabled
        @toggle-camera="toggleCamera()"
        @toggle-microphone="toggleMicrophone()"
      />
    </div>
    <div flex shrink-0 flex-col gap-y-4>
      <StyledCard p-6 text-center flex flex-1 flex-col gap-y-6 justify-center>
        <div flex flex-col gap-y-2>
          <h2 font-medium text-headline-small>Ready to join?</h2>
          <span op-medium-emphasis text-body-medium>{{ joinHint }}</span>
        </div>
        <StyledButton
          :button-props="{ loading: isRequestingJoin, size: 'large', text: joinButtonText }"
          @click="
            async () => {
              isRequestingJoin = true;
              await withFinalizerAsync(
                async () => {
                  if (isCreator) await joinCall(callId);
                  else await knockCall(callId);
                },
                () => {
                  isRequestingJoin = false;
                },
              );
            }
          "
        />
      </StyledCard>
      <div hidden shrink-0 lg:block :style="{ height: `${mediaControlsHeight}px` }" />
    </div>
  </div>
</template>
