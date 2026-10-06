import type { SoundEffect } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { parseSoundBankSounds } from "#src/services/genshinAssets/music/parseSoundBankSounds";
import { readFileRange } from "#src/services/genshinAssets/music/readFileRange";
import { readGameAudioPackages } from "#src/services/genshinAssets/music/readGameAudioPackages";
import { resolveVgmstream } from "#src/services/genshinAssets/music/resolveVgmstream";
import { computeSpectrogram } from "#src/services/genshinAssets/shared/computeSpectrogram";
import { MINIMUM_PACKAGE_NAME } from "#src/services/genshinAssets/shared/constants";
import { computeBandBins } from "#src/services/genshinParity/shared/computeBandBins";
import { readAudioSamples } from "#src/services/genshinParity/shared/readAudioSamples";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { MUSIC_NOISE_BAND_CENTRES } from "genshin-engine";
import { execFileSync } from "node:child_process";
import { mkdtemp, open, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The bank in the package the game loads first that holds the login's own sounds, and the two the door plays, each
// Found by matching every sound there against the door recording's burst over the music (`Index.reference.ts`), with
// How long after the first the second starts: a rumble, then a broadband rush a tenth of a second later, both at the
// Level they are stored at
const DOOR_BANK_ID = 3_844_515_483;
const DOOR_SOUNDS = [
  { id: 402_626_033, offsetSeconds: 0 },
  { id: 73_142_117, offsetSeconds: 0.1 },
] as const;
// The sounds' own rate, and the spectrum's windows: 2048 samples, 25 milliseconds apart
const SAMPLE_RATE = 48_000;
const FRAME_LENGTH = 2048;
const HOP_LENGTH = 1200;
// A level is kept to five decimals, a hundred decibels under the loudest a sample holds, where the sound has died
// Away; the sound ends at the last frame any band holds above none
const LEVEL_DECIMALS = 5;
// The door's sound as noise of our own: each of the game's two sounds decoded, its power in each octave band of
// `MUSIC_NOISE_BAND_CENTRES` read every hop from its spectrum (a Hann window's band of bins over the window's own
// Power, so a band's level is its noise's standard deviation, as `computeNoiseSamples` sounds it), centred on the hop by
// Leading the sound with half a window of silence, and the two summed at their offset, since noise apart adds its
// Power. Only the levels ship, never a sample of the game's
export const fitLoginDoorSound = async (): Promise<SoundEffect> => {
  const [minimum] = await readGameAudioPackages(MINIMUM_PACKAGE_NAME);
  const bankEntry = minimum?.audioPackage.banks.find(({ id }) => id === DOOR_BANK_ID);
  if (!minimum || !bankEntry)
    throw new InvalidOperationError(Operation.Read, MINIMUM_PACKAGE_NAME, `holds no bank ${DOOR_BANK_ID}`);
  let bank: Buffer;
  {
    await using file = await open(minimum.path);
    bank = await readFileRange(file, minimum.path, bankEntry.offset, bankEntry.size);
  }
  const sounds = parseSoundBankSounds(bank);
  const vgmstreamPath = await resolveVgmstream();
  const directory = await mkdtemp(join(tmpdir(), "door-sound-"));
  const bandPowers = await withFinalizerAsync(
    () =>
      Promise.all(
        DOOR_SOUNDS.map(async ({ id, offsetSeconds }) => {
          const sound = sounds.find((entry) => entry.id === id);
          if (!sound) throw new InvalidOperationError(Operation.Read, `bank ${DOOR_BANK_ID}`, `holds no sound ${id}`);
          const soundPath = join(directory, `${id}.wem`);
          const wavePath = join(directory, `${id}.wav`);
          await writeFile(soundPath, bank.subarray(sound.offset, sound.offset + sound.size));
          execFileSync(vgmstreamPath, ["-o", wavePath, soundPath], { stdio: "ignore" });
          const decoded = await readAudioSamples(wavePath, SAMPLE_RATE);
          const samples = new Float32Array(decoded.length + FRAME_LENGTH / 2);
          samples.set(decoded, FRAME_LENGTH / 2);
          const { binCount, frameCount, magnitudes } = computeSpectrogram(
            samples,
            SAMPLE_RATE,
            FRAME_LENGTH,
            HOP_LENGTH,
          );
          // A Hann window's power over its samples, three eighths, and a real signal's spectrum mirrored
          const scale = 2 / (FRAME_LENGTH * FRAME_LENGTH * (3 / 8));
          const offsetFrames = Math.round((offsetSeconds * SAMPLE_RATE) / HOP_LENGTH);
          return MUSIC_NOISE_BAND_CENTRES.map((centre) => {
            const [low, high] = computeBandBins(centre, SAMPLE_RATE, FRAME_LENGTH, binCount);
            return [
              ...Array.from({ length: offsetFrames }, () => 0),
              ...Array.from({ length: frameCount }, (_value, frame) => {
                let power = 0;
                for (let bin = low; bin <= high; bin++) power += (magnitudes[frame * binCount + bin] ?? 0) ** 2;
                return power * scale;
              }),
            ];
          });
        }),
      ),
    () => rm(directory, { force: true, recursive: true }),
  );
  const frameCount = Math.max(...bandPowers.flatMap((bands) => bands.map((powers) => powers.length)));
  const levels = Array.from({ length: frameCount }, (_value, frame) =>
    MUSIC_NOISE_BAND_CENTRES.map((_centre, band) =>
      roundFitted(Math.sqrt(bandPowers.reduce((sum, bands) => sum + (bands[band]?.[frame] ?? 0), 0)), LEVEL_DECIMALS),
    ),
  );
  const lastSounding = levels.findLastIndex((frameLevels) => frameLevels.some((level) => level > 0));
  return { frameSeconds: HOP_LENGTH / SAMPLE_RATE, levels: levels.slice(0, lastSounding + 1) };
};
