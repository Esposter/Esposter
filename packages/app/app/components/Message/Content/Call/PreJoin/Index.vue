<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { withFinalizerAsync } from "@esposter/shared";

interface PreJoinProps {
  callId: string;
  isCreator?: boolean;
}

const { callId, isCreator = false } = defineProps<PreJoinProps>();
const callStore = useCallStore();
const { joinCall } = callStore;
const knockerStore = useKnockerStore();
const { knockCall } = knockerStore;
const isRequestingJoin = ref(false);
const joinButtonText = computed(() => (isCreator ? "Join now" : "Request to join"));
const { cameraStream, isCameraEnabled, isMicrophoneEnabled, toggleCamera, toggleMicrophone } = useCallPreJoinMedia();
</script>

<template>
  <div bg-background flex flex-col size-full overflow-y-auto>
    <div p-6 flex flex-1 flex-col min-h-0 justify-center>
      <div flex flex-1 flex-col gap-y-6 min-h-0 items-stretch lg:flex-row lg:gap-x-10>
        <div flex flex-1 flex-col gap-y-4 min-w-0>
          <MessageContentCallPreJoinCameraPreview flex-1 min-h-0 :is-camera-enabled :stream="cameraStream" />
          <MessageContentCallPreJoinMediaControls
            :is-camera-enabled
            :is-microphone-enabled
            @toggle-camera="toggleCamera()"
            @toggle-microphone="toggleMicrophone()"
          />
        </div>
        <StyledCard p-6 text-center flex shrink-0 flex-col gap-y-6 items-stretch>
          <div flex flex-col gap-y-3 items-center>
            <h2 font-medium text-headline-small>Ready to join?</h2>
            <span op-medium-emphasis text-body-medium>Check your setup before joining the call.</span>
            <span op-medium-emphasis text-body-medium>
              {{
                isCreator
                  ? "Join when your setup looks right."
                  : "You will wait in the ready room until someone admits you."
              }}
            </span>
          </div>
          <div flex flex-col gap-y-3>
            <div flex gap-x-3 items-center>
              <v-icon :icon="isMicrophoneEnabled ? 'mdi-microphone' : 'mdi-microphone-off'" op-medium-emphasis />
              <span text-body-medium>{{ isMicrophoneEnabled ? "Microphone on" : "Microphone muted" }}</span>
            </div>
            <div flex gap-x-3 items-center>
              <v-icon :icon="isCameraEnabled ? 'mdi-video' : 'mdi-video-off'" op-medium-emphasis />
              <span text-body-medium>{{ isCameraEnabled ? "Camera on" : "Camera off" }}</span>
            </div>
          </div>
          <v-spacer />
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
      </div>
    </div>
  </div>
</template>
