import type { RemoteParticipant, RemoteTrack, RemoteTrackPublication, Track } from "livekit-client";

export const getRemoteStreamHandlers = (
  source: Track.Source,
  setStream: (identity: string, stream: MediaStream | undefined) => void,
) => ({
  attach: (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    if (publication.source !== source || !track.mediaStream) return;
    setStream(participant.identity, track.mediaStream);
  },
  detach: (_track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    if (publication.source !== source) return;
    setStream(participant.identity, undefined);
  },
});
