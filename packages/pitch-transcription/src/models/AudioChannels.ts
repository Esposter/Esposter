// A recording split into channels, the part of the browser's `AudioBuffer` the model reads, so a server or a worker can
// Hand one in without the DOM's types
export interface AudioChannels {
  getChannelData: (channel: number) => Float32Array;
  numberOfChannels: number;
  sampleRate: number;
}
