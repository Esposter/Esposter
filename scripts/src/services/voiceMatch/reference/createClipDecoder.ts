import type { ClipDecoder } from "#src/models/voiceMatch/ClipDecoder";

import { CODEBOOKS_VARIANT } from "#src/services/voiceMatch/constants";
import { getResult } from "@esposter/shared";
import { OggVorbisDecoder } from "@wasm-audio-decoders/ogg-vorbis";
import { convertWwiseRiffToOgg, getPackedCodebooks } from "ww2ogg-ts";

// A Wwise clip is Vorbis with its codebooks stripped, so the headers are rebuilt from the packed set the game used
// And the stream is then ordinary Ogg Vorbis. One decoder instance is reused for every clip and reset between them;
// A clip the converter rejects, or that decodes to nothing, is skipped rather than measured
export const createClipDecoder = async (): Promise<ClipDecoder> => {
  const codebooks = getPackedCodebooks(CODEBOOKS_VARIANT);
  const decoder = new OggVorbisDecoder();
  await decoder.ready;

  return {
    decode: async (bytes) => {
      const ogg = getResult(() => convertWwiseRiffToOgg(bytes, { codebooks })).match(
        (conversion) => conversion.ogg,
        () => undefined,
      );
      if (!ogg) return undefined;

      const { channelData, errors, sampleRate } = await decoder.decodeFile(new Uint8Array(ogg));
      await decoder.reset();
      const [samples] = channelData;
      return errors.length === 0 && samples && samples.length > 0 ? { sampleRate, samples } : undefined;
    },
    free: () => {
      decoder.free();
    },
  };
};
