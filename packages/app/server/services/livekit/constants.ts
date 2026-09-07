import { TrackSource } from "livekit-server-sdk";

// A participant's own audio and video, granted for the whole call. Screen share is the separable half: it is
// Granted at join and taken back by `stopLiveKitScreenShare`, which drops the participant to this pair — so
// The two halves are named rather than spelled out at both ends, where a moderator's revoke could silently
// Restore or drop a source the join grant never matched
export const CALL_TRACK_SOURCES = [TrackSource.MICROPHONE, TrackSource.CAMERA];

export const SCREEN_SHARE_TRACK_SOURCES = [TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO];

// How long LiveKit keeps a room nobody has joined. It has to outlast the gap between creating the room and the
// First participant connecting, and nothing beyond that: an abandoned call session leaves no room behind
export const LIVE_KIT_ROOM_EMPTY_TIMEOUT_SECONDS = Temporal.Duration.from({ minutes: 1 }).total("seconds");
