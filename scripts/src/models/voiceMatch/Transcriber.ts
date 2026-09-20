// One utterance at the model's sample rate in, the words it heard out
export type Transcriber = (samples: Float32Array) => Promise<string>;
