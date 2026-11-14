import type { MicrophoneGateSettings } from "@/models/message/room/call/MicrophoneGateSettings";

import { computeInputLevelDecibels } from "@/services/message/room/call/computeInputLevelDecibels";

// The microphone's gate on the audio thread, run once per render quantum: the block is read before the gain applies,
// Then written at the volume while the gate is open or as silence while it is closed. Nothing passes until the page has
// Sent its settings, so no block can carry unfiltered audio
export class MicrophoneGateProcessor extends AudioWorkletProcessor {
  #settings?: MicrophoneGateSettings;

  constructor() {
    super();
    this.port.onmessage = (event: MessageEvent<MicrophoneGateSettings>) => {
      this.#settings = event.data;
    };
  }

  override process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!input || !output) return true;

    const settings = this.#settings;
    const gain =
      settings && this.#checkIsOpen(settings, computeInputLevelDecibels(input))
        ? settings.microphoneVolumePercentage / 100
        : 0;
    for (const [index, sample] of input.entries()) output[index] = sample * gain;
    return true;
  }

  #checkIsOpen(settings: MicrophoneGateSettings, decibels: number) {
    return settings.isPushToTalk ? settings.isPushToTalkKeyHeld : decibels >= settings.inputSensitivityDecibels;
  }
}
