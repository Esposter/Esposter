// A streamed clip's keys by curve: its data is a run of frames, each a float time and a key count, then per key a curve
// Index and four cubic coefficients, the segment from that key's time on being ((a·t + b)·t + c)·t + d in the time
// Since it. The data is exported as 32-bit words, so a float is read back from its word's bits
export interface StreamedKey {
  coefficients: [number, number, number, number];
  time: number;
}
