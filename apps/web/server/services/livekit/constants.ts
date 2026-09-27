import { TrackSource } from "livekit-server-sdk";

// The separable half of what a participant publishes: a moderator stops it on its own (`updateLiveKitTrackSources`)
export const SCREEN_SHARE_TRACK_SOURCES = [TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO];
// Everything a join grants, and what a moderation revoke starts from when LiveKit reports no list of its own
export const JOIN_TRACK_SOURCES = [TrackSource.MICROPHONE, TrackSource.CAMERA, ...SCREEN_SHARE_TRACK_SOURCES];
// How long LiveKit keeps a room nobody has joined. It has to outlast the gap between creating the room and the
// First participant connecting, and nothing beyond that: an abandoned call session leaves no room behind
export const LIVE_KIT_ROOM_EMPTY_TIMEOUT_SECONDS = Temporal.Duration.from({ minutes: 1 }).total("seconds");
