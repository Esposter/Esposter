import type { OnlineSubscribableContext } from "@/composables/shared/useOnlineSubscribable";

import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { useParticipantStore } from "@/store/message/room/call/participant";

export const useCallJoinedSubscribables = () => {
  const onlineSubscribableContext: OnlineSubscribableContext = {
    instance: getCurrentInstance(),
    scope: getCurrentScope(),
  };
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { activeCallSessionId } = storeToRefs(callStore);
  const knockerStore = useKnockerStore();
  const participantStore = useParticipantStore();
  const { createCallParticipant, deleteCallParticipant, deleteSpeaker, setMute, setParticipantCamera } =
    participantStore;
  const { createKnocker } = knockerStore;

  useOnlineSubscribable(
    activeCallSessionId,
    (callSessionId) => {
      if (!callSessionId) return undefined;

      const participantJoinUnsubscribable = $trpc.roomCall.onJoinCall.subscribe(callSessionId, {
        onData: (participant) => {
          createCallParticipant(callSessionId, participant);
        },
      });
      const participantLeaveUnsubscribable = $trpc.roomCall.onLeaveCall.subscribe(callSessionId, {
        onData: (participantId) => {
          deleteCallParticipant(callSessionId, participantId);
          deleteSpeaker(participantId);
        },
      });
      const muteChangedUnsubscribable = $trpc.roomCall.onSetMute.subscribe(callSessionId, {
        onData: ({ id: participantId, isMuted }) => {
          setMute(callSessionId, participantId, isMuted);
        },
      });
      const videoChangedUnsubscribable = $trpc.roomCall.onVideoChanged.subscribe(callSessionId, {
        onData: ({ id: participantId, isCameraEnabled }) => {
          setParticipantCamera(callSessionId, participantId, isCameraEnabled);
        },
      });
      const knockCallUnsubscribable = $trpc.roomCall.onKnockCall.subscribe(callSessionId, {
        onData: (knocker) => {
          createKnocker(knocker);
        },
      });

      return () => {
        participantJoinUnsubscribable.unsubscribe();
        participantLeaveUnsubscribable.unsubscribe();
        muteChangedUnsubscribable.unsubscribe();
        videoChangedUnsubscribable.unsubscribe();
        knockCallUnsubscribable.unsubscribe();
      };
    },
    onlineSubscribableContext,
  );
};
