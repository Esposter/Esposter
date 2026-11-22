<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useCallStore } from "#src/store/message/room/call/index";
import { useRoomStore } from "#src/store/message/room/index";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const callStore = useCallStore();
const { isConnecting, isInCall } = storeToRefs(callStore);
const { joinCallByRoomId, leaveCall } = callStore;
const roomParticipantMap = useCallRoomParticipantMap();
</script>

<!-- The room's call from its header: who is in it and leaving it while the reader is, starting one otherwise -->
<template>
  <UiPopover v-if="isInCall" :label="`Call participants: ${roomParticipantMap.size}`" :variant="UiButtonVariant.Quiet">
    <template #trigger>
      <UiIcon text-success :meaning="UiIconMeaning.Call" />
      <span text-success>{{ roomParticipantMap.size }}</span>
    </template>
    <template #default="{ close }">
      <div w="[min(16rem,80dvw)]" flex flex-col>
        <p text-sm text-muted>In call</p>
        <div v-for="{ id, image, isMuted, name } of roomParticipantMap.values()" :key="id" ui-row>
          <UiItemContent :image="image ?? undefined" :title="name">
            <template v-if="isMuted" #append>
              <UiIcon text-muted :meaning="UiIconMeaning.MicrophoneOff" label="Muted" />
            </template>
          </UiItemContent>
        </div>
      </div>
    </template>
    <template #footer="{ close }">
      <UiButton
        :variant="UiButtonVariant.Danger"
        @click="
          () => {
            close();
            leaveCall();
          }
        "
      >
        <UiIcon :meaning="UiIconMeaning.HangUp" />
        Leave Call
      </UiButton>
    </template>
  </UiPopover>
  <UiIconButton
    v-else
    :is-pending="isConnecting"
    label="Start Call"
    :meaning="UiIconMeaning.Call"
    :variant="UiButtonVariant.Quiet"
    @click="joinCallByRoomId(currentRoomId)"
  />
</template>
