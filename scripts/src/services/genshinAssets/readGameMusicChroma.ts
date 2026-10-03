import type { Chroma } from "#src/models/genshinParity/Chroma";

import { MUSIC_DIRECTORY } from "#src/services/genshinAssets/constants";
import { decodeGameSounds } from "#src/services/genshinAssets/decodeGameSounds";
import { computeChroma } from "#src/services/genshinParity/computeChroma";
import { CHROMA_SAMPLE_RATE } from "#src/services/genshinParity/constants";
import { readAudioSamples } from "#src/services/genshinParity/readAudioSamples";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";

const CHROMA_DIRECTORY = join(MUSIC_DIRECTORY, "chroma");
const DECODE_DIRECTORY = join(MUSIC_DIRECTORY, "decoding");
// Every music sound's pitch classes and loudness by frame, by its id: each read once from its decoded WAV, which is
// Deleted after, and kept as its classes then its loudness, 32-bit floats, so a second match reads them in seconds
export const readGameMusicChroma = async (): Promise<Map<number, Chroma>> => {
  await mkdir(CHROMA_DIRECTORY, { recursive: true });
  const held = new Set(
    readdirSync(CHROMA_DIRECTORY)
      .map((name) => parse(name))
      .filter(({ ext }) => ext === ".bin")
      .map(({ name }) => Number(name)),
  );
  // oxlint-disable-next-line no-await-in-loop -- one sound's WAV is read and deleted before the next is decoded
  for await (const { id, path } of decodeGameSounds((soundId) => !held.has(soundId), DECODE_DIRECTORY)) {
    // oxlint-disable-next-line no-await-in-loop -- as above
    const { classes, loudness } = computeChroma(await readAudioSamples(path, CHROMA_SAMPLE_RATE), CHROMA_SAMPLE_RATE);
    // Written beside its name and renamed onto it, so a write cut short is never read as a whole sound's chroma
    const partialPath = join(CHROMA_DIRECTORY, `${id}.bin.partial`);
    // oxlint-disable-next-line no-await-in-loop -- as above
    await writeFile(partialPath, Buffer.concat([Buffer.from(classes.buffer), Buffer.from(loudness.buffer)]));
    // oxlint-disable-next-line no-await-in-loop -- as above
    await rename(partialPath, join(CHROMA_DIRECTORY, `${id}.bin`));
    // oxlint-disable-next-line no-await-in-loop -- as above
    await rm(path);
    held.add(id);
  }
  const soundChromaMap = new Map<number, Chroma>();
  await Promise.all(
    Array.from(held, async (id) => {
      const path = join(CHROMA_DIRECTORY, `${id}.bin`);
      if (!existsSync(path)) return;
      const data = await readFile(path);
      const values = new Float32Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
      const frameCount = values.length / 13;
      soundChromaMap.set(id, {
        classes: values.subarray(0, frameCount * 12),
        loudness: values.subarray(frameCount * 12),
      });
    }),
  );
  return soundChromaMap;
};
