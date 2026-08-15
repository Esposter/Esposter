import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { CallParticipantTileProps } from "@/models/message/room/call/CallParticipantTileProps";

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
  const {
    activeScreenShareParticipantId,
    isDeafened,
    localVideoStream,
    remoteVideoStreams,
    screenSharingParticipantIds,
  } = storeToRefs(mediaStore);
  const participantStore = useParticipantStore();
  const { callSessionParticipantsMap, speakingIds } = storeToRefs(participantStore);
  const callParticipantMap = computed(
    () => callSessionParticipantsMap.value.get(activeCallSessionId.value) ?? new Map<string, CallParticipant>(),
  );
  const presenterName = computed(() => {
    const participant = activeScreenShareParticipantId.value
      ? callParticipantMap.value.get(activeScreenShareParticipantId.value)
      : undefined;
    if (!participant) return "Someone";
    return participant.id === sessionId.value ? `${participant.name} (You)` : participant.name;
  });
  // Built once per render rather than per tile: the stage renders the same participants in two lists, and each
  // Tile's flags cost a scan of the speaking and screen-sharing id arrays
  const participantTilePropsMap = computed(() => {
    const screenSharingIdSet = new Set(screenSharingParticipantIds.value);
    const speakingIdSet = new Set(speakingIds.value);
    return new Map<string, CallParticipantTileProps>(
      [...callParticipantMap.value.values()].map((participant) => {
        const isSelf = participant.id === sessionId.value;
        return [
          participant.id,
          {
            isDeafened: isDeafened.value && isSelf,
            isScreenSharing: screenSharingIdSet.has(participant.id),
            isSelf,
            isSpeaking: speakingIdSet.has(participant.id),
            participant,
            videoStream: isSelf ? localVideoStream.value : remoteVideoStreams.value.get(participant.id),
          },
        ];
      }),
    );
  });
  return { callParticipantMap, participantTilePropsMap, presenterName, sessionId };
};
