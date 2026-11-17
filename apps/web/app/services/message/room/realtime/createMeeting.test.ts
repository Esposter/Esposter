import { EventEmitter } from "node:events";
import { describe, vi } from "vitest";

// The SDK's meeting is replaced by an emitter holding the methods the store calls, so each test drives the events
// The SDK would emit and reads the spies it needs
export const createMeeting = () => {
  const joinedEvents = new EventEmitter();
  const joined = Object.assign(new Map<string, EventEmitter>(), {
    on: (event: string, listener: (...args: unknown[]) => void) => {
      joinedEvents.on(event, listener);
    },
  });
  const self = Object.assign(new EventEmitter(), {
    addAudioMiddleware: vi.fn<() => Promise<{ message: string; success: boolean }>>(() =>
      Promise.resolve({ message: "", success: true }),
    ),
    addVideoMiddleware: vi.fn<() => Promise<{ message: string; success: boolean }>>(() =>
      Promise.resolve({ message: "", success: true }),
    ),
    disableAudio: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    disableScreenShare: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    disableVideo: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    enableAudio: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    enableScreenShare: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    enableVideo: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    rawAudioTrack: { applyConstraints: vi.fn<() => Promise<void>>(() => Promise.resolve()) },
    removeAllVideoMiddlewares: vi.fn<() => Promise<{ message: string; success: boolean }>>(() =>
      Promise.resolve({ message: "", success: true }),
    ),
    setDevice: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    videoEnabled: false,
    videoTrack: {} as MediaStreamTrack,
  });
  // The camera's state follows the calls that switch it, as the SDK's does
  self.enableVideo.mockImplementation(() => {
    self.videoEnabled = true;
    return Promise.resolve();
  });
  self.disableVideo.mockImplementation(() => {
    self.videoEnabled = false;
    return Promise.resolve();
  });
  const meeting = {
    join: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    leave: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    meta: new EventEmitter(),
    participants: Object.assign(new EventEmitter(), { joined }),
    self,
  };
  return { joinedEvents, meeting };
};

describe.todo("createMeeting");
