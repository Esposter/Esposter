// https://developer.mozilla.org/docs/Web/API/AudioWorkletProcessor
// Ambient type for the audio thread's global scope, which lib.dom does not declare. A worklet module extends its base
// Class and registers it there, and nothing on the page can reach either
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}
