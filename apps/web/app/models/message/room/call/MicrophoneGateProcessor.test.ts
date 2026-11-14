import type { MicrophoneGateSettings } from "@/models/message/room/call/MicrophoneGateSettings";

import { MicrophoneGateProcessor } from "@/models/message/room/call/MicrophoneGateProcessor";
import { DEFAULT_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

// The processor extends the worklet scope's base class, which only an AudioWorklet provides. Its port keeps the one
// Handler the processor's constructor sets, so a settings message is delivered by calling that handler
vi.hoisted(() => {
  vi.stubGlobal(
    "AudioWorkletProcessor",
    class AudioWorkletProcessorStub {
      port: { onmessage?: (event: MessageEvent) => void } = {};
    },
  );
});

const postSettings = (processor: MicrophoneGateProcessor, nextSettings: MicrophoneGateSettings) => {
  processor.port.onmessage?.(new MessageEvent("message", { data: nextSettings }));
};

describe(MicrophoneGateProcessor, () => {
  const renderQuantum = 128;
  // A loud block reads about -6 dB and a quiet one about -60 dB, either side of the default threshold
  const loudSample = 0.5;
  const quietSample = 0.001;
  const settings: MicrophoneGateSettings = {
    inputSensitivityDecibels: DEFAULT_INPUT_SENSITIVITY_DECIBELS,
    isPushToTalk: false,
    isPushToTalkKeyHeld: false,
    microphoneVolumePercentage: 100,
  };

  const processBlock = (processor: MicrophoneGateProcessor, sample: number) => {
    const output = new Float32Array(renderQuantum);
    processor.process([[new Float32Array(renderQuantum).fill(sample)]], [[output]]);
    return output;
  };

  test("a block above the voice-activity threshold is written at the microphone volume, boost included", () => {
    expect.hasAssertions();
    const processor = new MicrophoneGateProcessor();
    postSettings(processor, { ...settings, microphoneVolumePercentage: 150 });

    expect(processBlock(processor, loudSample)).toStrictEqual(new Float32Array(renderQuantum).fill(0.75));
  });

  test("a block below the voice-activity threshold is written as silence", () => {
    expect.hasAssertions();
    const processor = new MicrophoneGateProcessor();
    postSettings(processor, settings);

    expect(processBlock(processor, quietSample)).toStrictEqual(new Float32Array(renderQuantum));
  });

  test("a push-to-talk gate writes a loud block only while its key is held", () => {
    expect.hasAssertions();
    const processor = new MicrophoneGateProcessor();
    postSettings(processor, { ...settings, isPushToTalk: true });
    expect(processBlock(processor, loudSample)).toStrictEqual(new Float32Array(renderQuantum));

    postSettings(processor, { ...settings, isPushToTalk: true, isPushToTalkKeyHeld: true });
    expect(processBlock(processor, loudSample)).toStrictEqual(new Float32Array(renderQuantum).fill(loudSample));
  });

  test("nothing is written before the page's settings arrive, so no unfiltered audio can pass", () => {
    expect.hasAssertions();
    const processor = new MicrophoneGateProcessor();

    expect(processBlock(processor, loudSample)).toStrictEqual(new Float32Array(renderQuantum));
  });
});
