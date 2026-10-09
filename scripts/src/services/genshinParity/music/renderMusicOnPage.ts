import type { MusicVoice } from "genshin-engine";
import type { Page } from "playwright";

import { LISTEN_SAMPLE_RATE } from "#src/services/genshinParity/shared/constants";

// One segment of the login's music rendered offline on the parity page by its own screen's `renderMusic`, at
// `LISTEN_SAMPLE_RATE`. With `isLayered` false it is the synthesizer alone, and `voices` plays in place of the segment's own
export const renderMusicOnPage = async (
  page: Page,
  segmentIndex: number,
  isLayered: boolean,
  voices?: MusicVoice[],
): Promise<Float32Array> => {
  const rendered = await page.evaluate(
    ([index, sampleRate, isSegmentLayered, segmentVoices]) =>
      (
        Reflect.get(window, "renderMusic") as (
          segmentIndex: number,
          sampleRate: number,
          isLayered: boolean,
          voices?: MusicVoice[],
        ) => Promise<string>
      )(index, sampleRate, isSegmentLayered, segmentVoices),
    [segmentIndex, LISTEN_SAMPLE_RATE, isLayered, voices] as const,
  );
  const bytes = Buffer.from(rendered, "base64");
  return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
};
