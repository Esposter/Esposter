import type { ComponentPlaylist } from "#src/models/genshinAssets/ComponentPlaylist";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { MusicScore } from "#src/models/genshinParity/MusicScore";

import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { LISTEN_SAMPLE_RATE } from "#src/services/genshinParity/constants";
import { openParityPage } from "#src/services/genshinParity/openParityPage";
import { readAudioSamples } from "#src/services/genshinParity/readAudioSamples";
import { scoreMusicSegment } from "#src/services/genshinParity/scoreMusicSegment";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The size the parity page is opened at, which draws nothing for music
const PAGE_SIZE = 360;
// Each segment of a component's music that plays anything, our render against the game's: ours rendered offline on the
// Parity page by the screen that plays it, through the notes and instruments the screen ships, and the game's laid out
// From its exported sources as the playlist's clips play them, each source from `playAt` with its trims cut
export const listenToMusic = async (
  component: DerivedAssetComponent,
  screen: string,
): Promise<{ id: number; score: MusicScore }[]> => {
  const { music } = getComponentDirectory(component);
  const { segments } = parseMachineJson<ComponentPlaylist>(await readFile(join(music, "playlist.json"), "utf8"));
  const { browser, page } = await openParityPage({ height: PAGE_SIZE, screen, width: PAGE_SIZE });
  await using _browser = { [Symbol.asyncDispose]: () => browser.close() };
  const scores: { id: number; score: MusicScore }[] = [];
  for (const [index, { clips, duration, id }] of segments.entries()) {
    if (clips.length === 0) continue;
    const game = new Float32Array(Math.ceil((duration / 1000) * LISTEN_SAMPLE_RATE));
    for (const { beginTrim, duration: sourceDuration, endTrim, playAt, sourceId } of clips) {
      // oxlint-disable-next-line no-await-in-loop -- one source is read at a time
      const source = await readAudioSamples(join(music, `${sourceId}.wav`), LISTEN_SAMPLE_RATE);
      const toSample = (milliseconds: number): number => Math.round((milliseconds / 1000) * LISTEN_SAMPLE_RATE);
      for (let sample = toSample(beginTrim); sample < toSample(sourceDuration + endTrim); sample++) {
        const at = toSample(playAt) + sample;
        if (at >= 0 && at < game.length) game[at] = (game[at] ?? 0) + (source[sample] ?? 0);
      }
    }
    // oxlint-disable-next-line no-await-in-loop -- the page renders one segment at a time
    const rendered = await page.evaluate(
      ([segmentIndex, sampleRate]) =>
        (Reflect.get(window, "renderMusic") as (segmentIndex: number, sampleRate: number) => Promise<string>)(
          segmentIndex,
          sampleRate,
        ),
      [index, LISTEN_SAMPLE_RATE] as const,
    );
    const bytes = Buffer.from(rendered, "base64");
    const ours = new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    scores.push({ id, score: scoreMusicSegment(ours, game, LISTEN_SAMPLE_RATE) });
  }
  return scores;
};
