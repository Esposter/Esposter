// @vitest-environment nuxt
import { useMediaStore } from "@/store/message/room/call/media";
import { getMockSession } from "@@/server/trpc/context.test";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useMediaStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("setRemoteScreenShareStream stores the remote screen share stream", () => {
    expect.hasAssertions();

    const stream = new MediaStream();
    const participantId = getMockSession().session.id;
    const mediaStore = useMediaStore();
    const { setRemoteScreenShareStream } = mediaStore;
    const { hasScreenShare, remoteScreenShareStreams, screenSharingParticipantIds } = storeToRefs(mediaStore);
    setRemoteScreenShareStream(participantId, stream);

    expect(hasScreenShare.value).toBe(true);
    expect(remoteScreenShareStreams.value.get(participantId)).toBe(stream);
    expect(screenSharingParticipantIds.value).toStrictEqual([participantId]);
  });

  test("setRemoteScreenShareStream removes the remote screen share stream", () => {
    expect.hasAssertions();

    const stream = new MediaStream();
    const participantId = getMockSession().session.id;
    const mediaStore = useMediaStore();
    const { setRemoteScreenShareStream } = mediaStore;
    const { hasScreenShare, pinnedParticipantId, remoteScreenShareStreams, screenSharingParticipantIds } =
      storeToRefs(mediaStore);
    setRemoteScreenShareStream(participantId, stream);
    pinnedParticipantId.value = participantId;
    setRemoteScreenShareStream(participantId, undefined);

    expect(hasScreenShare.value).toBe(false);
    expect(remoteScreenShareStreams.value.has(participantId)).toBe(false);
    expect(screenSharingParticipantIds.value).toStrictEqual([]);
    expect(pinnedParticipantId.value).toBe("");
  });

  test("setParticipantVolumePercentage stores the participant volume percentage", () => {
    expect.hasAssertions();

    const participantId = getMockSession().session.id;
    const mediaStore = useMediaStore();
    const { setParticipantVolumePercentage } = mediaStore;
    const { participantVolumePercentageMap } = storeToRefs(mediaStore);
    setParticipantVolumePercentage(participantId, 1);

    expect(participantVolumePercentageMap.value.get(participantId)).toBe(1);
  });

  test("deleteParticipantVolumePercentage removes the participant volume percentage", () => {
    expect.hasAssertions();

    const participantId = getMockSession().session.id;
    const mediaStore = useMediaStore();
    const { deleteParticipantVolumePercentage, setParticipantVolumePercentage } = mediaStore;
    const { participantVolumePercentageMap } = storeToRefs(mediaStore);
    setParticipantVolumePercentage(participantId, 1);
    deleteParticipantVolumePercentage(participantId);

    expect(participantVolumePercentageMap.value.has(participantId)).toBe(false);
  });

  test("resetCallMedia clears the participant volume percentages", () => {
    expect.hasAssertions();

    const participantId = getMockSession().session.id;
    const mediaStore = useMediaStore();
    const { resetCallMedia, setParticipantVolumePercentage } = mediaStore;
    const { participantVolumePercentageMap } = storeToRefs(mediaStore);
    setParticipantVolumePercentage(participantId, 1);
    resetCallMedia();

    expect(participantVolumePercentageMap.value.size).toBe(0);
  });
});
