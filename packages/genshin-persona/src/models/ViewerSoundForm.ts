// The form the viewer takes a clip's sound in: the WAV file's path, which it plays on the model, or only a compressed
// Clip, which this build does not write, so the stock player keeps the sound and the viewer shows the bubble alone
export enum ViewerSoundForm {
  // The viewer plays the clip's WAV file on the model
  WavPath = "wavPath",
  // The viewer takes only a compressed clip, so the stock player plays the sound
  CompressedOnly = "compressedOnly",
}
