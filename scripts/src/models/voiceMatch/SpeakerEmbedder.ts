// One utterance at the model's sample rate in, one unit vector out
export type SpeakerEmbedder = (samples: Float32Array) => Promise<Float32Array>;
