import { EventEmitter } from "node:events";
import { describe } from "vitest";

// A participant is the emitter the SDK hands out, carrying the fields the store reads on attach
export const createParticipant = (customParticipantId: string) =>
  Object.assign(new EventEmitter(), {
    audioEnabled: true,
    audioTrack: {} as MediaStreamTrack,
    customParticipantId,
    screenShareEnabled: false,
    screenShareTracks: {},
    videoEnabled: false,
    videoTrack: {} as MediaStreamTrack,
  });

describe.todo("createParticipant");
