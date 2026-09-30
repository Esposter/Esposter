// @vitest-environment nuxt
import type { RemoteParticipant, RemoteTrack, RemoteTrackPublication } from "livekit-client";

import { useMediaStore } from "@/store/message/room/call/media";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { Room, RoomEvent, Track } from "livekit-client";
import { describe, expect, test, vi } from "vitest";

describe(useLiveKitStore, () => {
  test("startAudio plays the blocked sound and keeps a deafened reader muted", async () => {
    expect.hasAssertions();

    const element = document.createElement("audio");
    const room = new Room();
    const mediaStore = useMediaStore();
    const liveKitStore = useLiveKitStore();
    const { connect, startAudio } = liveKitStore;
    const { isAudioPlaybackBlocked } = storeToRefs(liveKitStore);
    vi.spyOn(room, "connect").mockResolvedValue();
    vi.spyOn(room.localParticipant, "setMicrophoneEnabled").mockResolvedValue(undefined);
    // LiveKit's own startAudio unmutes every attached element before it reports playback started
    vi.spyOn(room, "startAudio").mockImplementation(() => {
      element.muted = false;
      room.emit(RoomEvent.AudioPlaybackStatusChanged, true);
      return Promise.resolve();
    });
    await connect(room, "", "", vi.fn<() => Promise<void>>(), false);
    mediaStore.isDeafened = true;
    room.emit(
      RoomEvent.TrackSubscribed,
      { attach: () => element } as unknown as RemoteTrack,
      { source: Track.Source.Microphone } as RemoteTrackPublication,
      { identity: "" } as RemoteParticipant,
    );
    room.emit(RoomEvent.AudioPlaybackStatusChanged, false);

    expect(isAudioPlaybackBlocked.value).toBe(true);

    await startAudio();

    expect(isAudioPlaybackBlocked.value).toBe(false);
    expect(element.muted).toBe(true);
  });
});
