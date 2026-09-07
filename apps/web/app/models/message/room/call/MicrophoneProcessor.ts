import type { AudioProcessorOptions, Track, TrackProcessor } from "livekit-client";

import { MIN_INPUT_SENSITIVITY_DECIBELS, VoiceInputMode } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";

// Native Web Audio mic processor: applies the user's mic volume as gain and gates transmission below
// The voice-activity threshold (Voice Activity) or while the push-to-talk key is released (Push To
// Talk). LiveKit owns the lifecycle — init on publish, restart on device switch, destroy on
// Unpublish — so there is no manual track-republish to manage.
export class MicrophoneProcessor implements TrackProcessor<Track.Kind.Audio, AudioProcessorOptions> {
  inputSensitivityDecibels = MIN_INPUT_SENSITIVITY_DECIBELS;
  // Driven by the push-to-talk keybind listener (usePushToTalk) via the liveKit store.
  isPushToTalkKeyHeld = false;
  microphoneVolumePercentage = 100;
  name = "microphone-processor";
  processedTrack?: MediaStreamTrack;
  voiceInputMode = VoiceInputMode.VoiceActivity;
  #analyser?: AnalyserNode;
  #animationFrameId?: number;
  #audioContext?: AudioContext;
  #gainNode?: GainNode;
  #source?: MediaStreamAudioSourceNode;
  #timeDomainData?: Float32Array<ArrayBuffer>;

  async destroy() {
    if (this.#animationFrameId !== undefined) window.cancelAnimationFrame(this.#animationFrameId);
    this.#source?.disconnect();
    this.#gainNode?.disconnect();
    this.#analyser?.disconnect();
    await this.#audioContext?.close();
  }

  init(options: AudioProcessorOptions) {
    this.#audioContext = options.audioContext;
    this.#gainNode = this.#audioContext.createGain();
    this.#analyser = this.#audioContext.createAnalyser();
    this.#analyser.fftSize = 1024;
    this.#timeDomainData = new Float32Array(this.#analyser.fftSize);
    const destination = this.#audioContext.createMediaStreamDestination();
    this.#gainNode.connect(destination);
    this.#connectSource(options.track);
    this.processedTrack = destination.stream.getAudioTracks()[0];
    this.#tick();
    return Promise.resolve();
  }

  restart(options: AudioProcessorOptions) {
    this.#audioContext = options.audioContext;
    this.#connectSource(options.track);
    return Promise.resolve();
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
  // The analyser taps the source pre-gain so a gated (gain 0) mic can still detect speech and reopen.
  #connectSource(track: MediaStreamTrack) {
    if (!this.#audioContext || !this.#gainNode || !this.#analyser) return;
    this.#source?.disconnect();
    this.#source = this.#audioContext.createMediaStreamSource(new MediaStream([track]));
    this.#source.connect(this.#analyser);
    this.#source.connect(this.#gainNode);
  }

  readonly #tick = () => {
    if (this.#gainNode && this.#analyser && this.#timeDomainData) {
      this.#analyser.getFloatTimeDomainData(this.#timeDomainData);
      let sumSquares = 0;
      for (const sample of this.#timeDomainData) sumSquares += sample * sample;
      const rootMeanSquare = Math.sqrt(sumSquares / this.#timeDomainData.length);
      const decibels = rootMeanSquare > 0 ? 20 * Math.log10(rootMeanSquare) : MIN_INPUT_SENSITIVITY_DECIBELS;
      this.#gainNode.gain.value = this.#checkIsOpen(decibels) ? this.microphoneVolumePercentage / 100 : 0;
    }
    this.#animationFrameId = window.requestAnimationFrame(this.#tick);
  };
}
