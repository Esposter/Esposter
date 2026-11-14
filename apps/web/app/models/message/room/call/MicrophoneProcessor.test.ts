import { MicrophoneProcessor } from "@/models/message/room/call/MicrophoneProcessor";
import microphoneGateUrl from "@/workers/message/room/call/microphoneGate.worklet?worker&url";
import { DEFAULT_INPUT_SENSITIVITY_DECIBELS, VoiceInputMode } from "@esposter/db-schema";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(MicrophoneProcessor, () => {
  let addModule: ReturnType<typeof vi.fn<(moduleUrl: string) => Promise<void>>>;
  class AudioWorkletNodeStub {
    disconnect = vi.fn<() => void>();
    port = { postMessage: vi.fn<(message: unknown) => void>() };

    constructor() {
      // A browser refuses a node for a processor its context has not loaded, so the stub refuses it too
      if (addModule.mock.calls.length === 0)
        throw new Error("The node was built before its processor module was added");
    }
  }
  // Only the members the middleware reaches are present, so the context is a plain object rather than a stub class
  const createAudioContext = () =>
    ({
      audioWorklet: { addModule },
      close: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    }) as unknown as AudioContext;

  beforeEach(() => {
    addModule = vi.fn<(moduleUrl: string) => Promise<void>>(() => Promise.resolve());
    vi.stubGlobal("AudioWorkletNode", AudioWorkletNodeStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("the gate module is added to a new context before its node is built", async () => {
    expect.hasAssertions();
    const processor = new MicrophoneProcessor();

    await processor.audioMiddleware(createAudioContext());

    expect(addModule).toHaveBeenCalledExactlyOnceWith(microphoneGateUrl);
  });

  test("a graph built after the page's settings change starts with them, and a later change reaches the same node", async () => {
    expect.hasAssertions();
    const processor = new MicrophoneProcessor();
    processor.inputSensitivityDecibels = DEFAULT_INPUT_SENSITIVITY_DECIBELS;
    processor.voiceInputMode = VoiceInputMode.PushToTalk;
    processor.isPushToTalkKeyHeld = true;
    const node = await processor.audioMiddleware(createAudioContext());
    const initialSettings = {
      inputSensitivityDecibels: DEFAULT_INPUT_SENSITIVITY_DECIBELS,
      isPushToTalk: true,
      isPushToTalkKeyHeld: true,
      microphoneVolumePercentage: 100,
    };

    expect(node.port.postMessage).toHaveBeenLastCalledWith(initialSettings);

    processor.microphoneVolumePercentage = 150;

    expect(node.port.postMessage).toHaveBeenLastCalledWith({ ...initialSettings, microphoneVolumePercentage: 150 });
  });

  test("a new run closes the previous run's context and disconnects its graph", async () => {
    expect.hasAssertions();
    const processor = new MicrophoneProcessor();
    const firstContext = createAudioContext();
    const firstNode = await processor.audioMiddleware(firstContext);

    await processor.audioMiddleware(createAudioContext());

    expect(firstContext.close).toHaveBeenCalledExactlyOnceWith();
    expect(firstNode.disconnect).toHaveBeenCalledExactlyOnceWith();
  });
});
