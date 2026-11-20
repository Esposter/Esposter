import { EventEmitter } from "node:events";
import { describe, vi } from "vitest";

// A middleware the SDK accepts answers with no message
const acceptMiddleware = () => Promise.resolve({ message: "", success: true });
const createResolvedMock = () => vi.fn<() => Promise<void>>(() => Promise.resolve());
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
    addAudioMiddleware: vi.fn<typeof acceptMiddleware>(acceptMiddleware),
    addVideoMiddleware: vi.fn<typeof acceptMiddleware>(acceptMiddleware),
    disableAudio: createResolvedMock(),
    disableScreenShare: createResolvedMock(),
    disableVideo: createResolvedMock(),
    enableAudio: createResolvedMock(),
    enableScreenShare: createResolvedMock(),
    enableVideo: createResolvedMock(),
    rawAudioTrack: { applyConstraints: createResolvedMock() },
    removeAllVideoMiddlewares: vi.fn<typeof acceptMiddleware>(acceptMiddleware),
    setDevice: createResolvedMock(),
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
    join: createResolvedMock(),
    leave: createResolvedMock(),
    meta: new EventEmitter(),
    participants: Object.assign(new EventEmitter(), { joined }),
    self,
  };
  return { joinedEvents, meeting };
};

describe.todo("createMeeting");
