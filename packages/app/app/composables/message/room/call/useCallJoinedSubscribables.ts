import type { OnlineSubscribableContext } from "@/composables/shared/useOnlineSubscribable";

import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";

export const useCallJoinedSubscribables = (onlineSubscribableContext: OnlineSubscribableContext) => {
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { activeCallSessionId } = storeToRefs(callStore);
  const knockerStore = useKnockerStore();
  const mediaStore = useMediaStore();
  const { deleteParticipantVolumePercentage } = mediaStore;
  const participantStore = useParticipantStore();
  const {
    createCallParticipant,
    deleteCallParticipant,
    deleteSpeaker,
    setParticipantCameraEnabled,
    setParticipantHandRaised,
    setParticipantMuted,
  } = participantStore;
  const { createKnocker } = knockerStore;

  useOnlineSubscribable(
    activeCallSessionId,
    (callSessionId) => {
      if (!callSessionId) return undefined;

      const joinCallUnsubscribable = $trpc.callSession.onJoinCall.subscribe(callSessionId, {
        onData: (participant) => {
          createCallParticipant(callSessionId, participant);
        },
      });
      const leaveCallUnsubscribable = $trpc.callSession.onLeaveCall.subscribe(callSessionId, {
        onData: (participantId) => {
          deleteCallParticipant(callSessionId, participantId);
          deleteSpeaker(participantId);
          deleteParticipantVolumePercentage(participantId);
        },
      });
      const setHandRaisedUnsubscribable = $trpc.callSession.onSetHandRaised.subscribe(callSessionId, {
        onData: ({ id: participantId, isHandRaised }) => {
          setParticipantHandRaised(callSessionId, participantId, isHandRaised);
        },
      });
      const setMutedUnsubscribable = $trpc.callSession.onSetMuted.subscribe(callSessionId, {
        onData: ({ id: participantId, isMuted }) => {
          setParticipantMuted(callSessionId, participantId, isMuted);
        },
      });
      const setCameraEnabledUnsubscribable = $trpc.callSession.onSetCameraEnabled.subscribe(callSessionId, {
        onData: ({ id: participantId, isCameraEnabled }) => {
          setParticipantCameraEnabled(callSessionId, participantId, isCameraEnabled);
        },
      });
      const knockCallUnsubscribable = $trpc.callSession.knocker.onKnockCall.subscribe(callSessionId, {
        onData: (knocker) => {
          createKnocker(knocker);
        },
      });

      return () => {
        joinCallUnsubscribable.unsubscribe();
        leaveCallUnsubscribable.unsubscribe();
        setHandRaisedUnsubscribable.unsubscribe();
        setMutedUnsubscribable.unsubscribe();
        setCameraEnabledUnsubscribable.unsubscribe();
        knockCallUnsubscribable.unsubscribe();
      };
    },
    onlineSubscribableContext,
  );
};
