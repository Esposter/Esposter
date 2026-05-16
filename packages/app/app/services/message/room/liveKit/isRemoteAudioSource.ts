import { Track } from "livekit-client";

export const isRemoteAudioSource = (source: Track.Source) =>
  [Track.Source.Microphone, Track.Source.ScreenShareAudio].includes(source);
