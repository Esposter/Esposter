import type { AudioProcessorOptions, Track, TrackProcessor } from "livekit-client";

import { MIN_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";

// Native Web Audio mic processor: applies the user's mic volume as gain and gates transmission below
// The voice-activity threshold. LiveKit owns the lifecycle — init on publish, restart on device
// Switch, destroy on unpublish — so there is no manual track-republish to manage.
export class MicrophoneProcessor implements TrackProcessor<Track.Kind.Audio, AudioProcessorOptions> {
  inputSensitivityDecibels = MIN_INPUT_SENSITIVITY_DECIBELS;
  isVoiceActivity = true;
  microphoneVolumePercentage = 100;
  name = "microphone-processor";
  processedTrack?: MediaStreamTrack;
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
      const rms = Math.sqrt(sumSquares / this.#timeDomainData.length);
      const decibels = rms > 0 ? 20 * Math.log10(rms) : MIN_INPUT_SENSITIVITY_DECIBELS;
      const isOpen = !this.isVoiceActivity || decibels >= this.inputSensitivityDecibels;
      this.#gainNode.gain.value = isOpen ? this.microphoneVolumePercentage / 100 : 0;
    }
    this.#animationFrameId = window.requestAnimationFrame(this.#tick);
  };
}
