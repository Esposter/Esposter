import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { CallParticipantTileProps } from "@/components/Message/Content/Call/Participant/Tile.vue";

import { authClient } from "@/services/auth/authClient";
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";

export const useCallParticipantTiles = () => {
  const session = authClient.useSession();
  const sessionId = computed(() => session.value.data?.session.id);
  const callStore = useCallStore();
  const { activeCallSessionId } = storeToRefs(callStore);
  const mediaStore = useMediaStore();
  const { isDeafened, localVideoStream, remoteVideoStreams, screenSharingParticipantIds } = storeToRefs(mediaStore);
  const participantStore = useParticipantStore();
  const { callSessionParticipantsMap, speakingIds } = storeToRefs(participantStore);
  const callParticipantMap = computed(
    () => callSessionParticipantsMap.value.get(activeCallSessionId.value) ?? new Map<string, CallParticipant>(),
  );
  const getParticipantTileProps = (participant: CallParticipant): CallParticipantTileProps => ({
    isDeafened: isDeafened.value && participant.id === sessionId.value,
    isHandRaised: participant.isHandRaised,
    isScreenSharing: screenSharingParticipantIds.value.includes(participant.id),
    isSelf: participant.id === sessionId.value,
    isSpeaking: speakingIds.value.includes(participant.id),
    participant,
    videoStream:
      participant.id === sessionId.value
        ? (localVideoStream.value ?? undefined)
        : remoteVideoStreams.value.get(participant.id),
  });
  return { callParticipantMap, getParticipantTileProps, sessionId };
};
