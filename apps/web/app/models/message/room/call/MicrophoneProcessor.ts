import { computeInputLevelDecibels } from "@/services/message/room/call/computeInputLevelDecibels";
import { MIN_INPUT_SENSITIVITY_DECIBELS, VoiceInputMode } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";

// The mic's Web Audio stage, handed to RealtimeKit as an audio middleware. It applies the user's mic volume as gain
// And gates transmission below the voice-activity threshold (Voice Activity) or while the push-to-talk key is up
// (Push To Talk). RealtimeKit calls the middleware with each new audio context and sends the node it returns in place
// Of the raw microphone, so the gate reads each block before the gain applies. The node is a ScriptProcessorNode, the
// One node RealtimeKit's middleware type names, because it runs the gate on the block it is handed
export class MicrophoneProcessor {
  inputSensitivityDecibels = MIN_INPUT_SENSITIVITY_DECIBELS;
  // Driven by the push-to-talk keybind listener (usePushToTalk) via the realtime store.
  isPushToTalkKeyHeld = false;
  microphoneVolumePercentage = 100;
  voiceInputMode = VoiceInputMode.VoiceActivity;
  #audioContext?: AudioContext;
  #processor?: ScriptProcessorNode;

  // Held by reference, so RealtimeKit's add and remove both name the same middleware
  readonly audioMiddleware = async (audioContext: AudioContext) => {
    // Each run builds a graph in a new context, so the previous run's graph and its context close here
    await this.destroy();
    const processor = audioContext.createScriptProcessor(1024, 1, 1);
    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const output = event.outputBuffer.getChannelData(0);
      const gain = this.#checkIsOpen(computeInputLevelDecibels(input)) ? this.microphoneVolumePercentage / 100 : 0;
      for (const [index, sample] of input.entries()) output[index] = sample * gain;
    };
    this.#audioContext = audioContext;
    this.#processor = processor;
    return processor;
  };

  async destroy() {
    this.#processor?.disconnect();
    this.#processor = undefined;
    await this.#audioContext?.close();
    this.#audioContext = undefined;
  }

  #checkIsOpen(decibels: number) {
    switch (this.voiceInputMode) {
      case VoiceInputMode.PushToTalk:
        return this.isPushToTalkKeyHeld;
      case VoiceInputMode.VoiceActivity:
        return decibels >= this.inputSensitivityDecibels;
      default:
        return exhaustiveGuard(this.voiceInputMode);
    }
  }
}
