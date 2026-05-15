<script setup lang="ts">
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { withFinalizerAsync } from "@esposter/shared";

interface PreJoinProps {
  callId: string;
}

const props = defineProps<PreJoinProps>();
const knockerStore = useKnockerStore();
const { knockCall } = knockerStore;
const isRequestingJoin = ref(false);
const { cameraStream, isCameraEnabled, isMicrophoneEnabled, toggleCamera, toggleMicrophone } = useCallPreJoinMedia();
const requestJoin = async () => {
  isRequestingJoin.value = true;
  await withFinalizerAsync(
    async () => {
      await knockCall(props.callId);
    },
    () => {
      isRequestingJoin.value = false;
    },
  );
};
</script>

<template>
  <div p-6 bg-background flex flex-col gap-y-8 size-full items-center justify-center>
    <StyledCard p-6 flex flex-col gap-y-8 max-w-xl w-full items-center>
      <h2 font-medium text-headline-small>Ready to join?</h2>
      <MessageContentCallPreJoinCameraPreview :is-camera-enabled :stream="cameraStream" />
      <MessageContentCallPreJoinMediaControls
        :is-camera-enabled
        :is-microphone-enabled
        @toggle-camera="toggleCamera()"
        @toggle-microphone="toggleMicrophone()"
      />
      <StyledButton
        :button-props="{ loading: isRequestingJoin, size: 'large', text: 'Request to join' }"
        @click="requestJoin()"
      />
    </StyledCard>
  </div>
</template>
