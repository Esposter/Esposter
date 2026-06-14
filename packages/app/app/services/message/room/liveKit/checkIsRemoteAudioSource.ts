import { Track } from "livekit-client";

export const checkIsRemoteAudioSource = (source: Track.Source) =>
  [Track.Source.Microphone, Track.Source.ScreenShareAudio].includes(source);
