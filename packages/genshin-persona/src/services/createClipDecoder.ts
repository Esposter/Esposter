import type { ClipDecoder } from "#src/models/ClipDecoder";

import { OggVorbisDecoder } from "@wasm-audio-decoders/ogg-vorbis";

// The wiki serves every line as plain Ogg Vorbis. One decoder instance is reused for every clip and reset between
// Them; a file that decodes to nothing, or with errors, is skipped rather than measured or spoken from
export const createClipDecoder = async (): Promise<ClipDecoder> => {
  const decoder = new OggVorbisDecoder();
  await decoder.ready;

  return {
    decode: async (bytes) => {
      const { channelData, errors, sampleRate } = await decoder.decodeFile(bytes);
      await decoder.reset();
      const [samples] = channelData;
      return errors.length === 0 && samples && samples.length > 0 ? { sampleRate, samples } : undefined;
    },
    free: () => {
      decoder.free();
    },
  };
};
