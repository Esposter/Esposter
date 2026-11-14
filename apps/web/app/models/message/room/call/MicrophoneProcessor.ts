import type { MicrophoneGateSettings } from "@/models/message/room/call/MicrophoneGateSettings";

import { MICROPHONE_GATE_PROCESSOR_NAME } from "@/services/message/room/call/constants";
import microphoneGateUrl from "@/workers/message/room/call/microphoneGate.worklet?worker&url";
import { MIN_INPUT_SENSITIVITY_DECIBELS, VoiceInputMode } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";

// The mic's Web Audio stage, handed to RealtimeKit as an audio middleware. It applies the user's mic volume as gain
// And gates transmission below the voice-activity threshold (Voice Activity) or while the push-to-talk key is up
// (Push To Talk). RealtimeKit calls the middleware with each new audio context and sends the node it returns in place
// Of the raw microphone. That node is an AudioWorkletNode running the gate on the audio thread, so each setting is
// Posted to it as it changes, and the gate reads each render quantum before the gain applies
export class MicrophoneProcessor {
  get inputSensitivityDecibels() {
    return this.#inputSensitivityDecibels;
  }

  set inputSensitivityDecibels(inputSensitivityDecibels: number) {
    this.#inputSensitivityDecibels = inputSensitivityDecibels;
    this.#postSettings();
  }

  // Driven by the push-to-talk keybind listener (usePushToTalk) via the realtime store.
  get isPushToTalkKeyHeld() {
    return this.#isPushToTalkKeyHeld;
  }

  set isPushToTalkKeyHeld(isPushToTalkKeyHeld: boolean) {
    this.#isPushToTalkKeyHeld = isPushToTalkKeyHeld;
    this.#postSettings();
  }

  get microphoneVolumePercentage() {
    return this.#microphoneVolumePercentage;
  }

  set microphoneVolumePercentage(microphoneVolumePercentage: number) {
    this.#microphoneVolumePercentage = microphoneVolumePercentage;
    this.#postSettings();
  }

  get voiceInputMode() {
    return this.#voiceInputMode;
  }

  set voiceInputMode(voiceInputMode: VoiceInputMode) {
    this.#voiceInputMode = voiceInputMode;
    this.#postSettings();
  }

  #audioContext?: AudioContext;
  #inputSensitivityDecibels = MIN_INPUT_SENSITIVITY_DECIBELS;
  #isPushToTalkKeyHeld = false;
  #microphoneVolumePercentage = 100;
  #processor?: AudioWorkletNode;
  #voiceInputMode = VoiceInputMode.VoiceActivity;

  // Held by reference, so RealtimeKit's add and remove both name the same middleware
  readonly audioMiddleware = async (audioContext: AudioContext) => {
    // Each run builds a graph in a new context, so the previous run's graph and its context close here
    await this.destroy();
    await audioContext.audioWorklet.addModule(microphoneGateUrl);
    // Mono in and out, so the gate's one channel is the microphone's and the browser does not up-mix it to stereo
    const processor = new AudioWorkletNode(audioContext, MICROPHONE_GATE_PROCESSOR_NAME, {
      channelCount: 1,
      channelCountMode: "explicit",
      outputChannelCount: [1],
    });
    this.#audioContext = audioContext;
    this.#processor = processor;
    this.#postSettings();
    return processor;
  };

  async destroy() {
    this.#processor?.disconnect();
    this.#processor = undefined;
    await this.#audioContext?.close();
    this.#audioContext = undefined;
  }

  #checkIsPushToTalk() {
    switch (this.#voiceInputMode) {
      case VoiceInputMode.PushToTalk:
        return true;
      case VoiceInputMode.VoiceActivity:
        return false;
      default:
        return exhaustiveGuard(this.#voiceInputMode);
    }
  }

  #postSettings() {
    const settings = {
      inputSensitivityDecibels: this.#inputSensitivityDecibels,
      isPushToTalk: this.#checkIsPushToTalk(),
      isPushToTalkKeyHeld: this.#isPushToTalkKeyHeld,
      microphoneVolumePercentage: this.#microphoneVolumePercentage,
    } satisfies MicrophoneGateSettings;
    // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a MessagePort's postMessage takes no origin
    this.#processor?.port.postMessage(settings);
  }
}
