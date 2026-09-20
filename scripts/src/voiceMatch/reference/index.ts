import type { CharacterReference } from "#src/models/voiceMatch/CharacterReference";

import { AUDIO_TRACK_LANGUAGES, FRESH_FLAG, REFERENCES_DIRECTORY } from "#src/services/voiceMatch/constants";
import { createSpeakerEmbedder } from "#src/services/voiceMatch/createSpeakerEmbedder";
import { readKeptRecords } from "#src/services/voiceMatch/readKeptRecords";
import { createClipDecoder } from "#src/services/voiceMatch/reference/createClipDecoder";
import { readCharacterProfile } from "#src/services/voiceMatch/reference/readCharacterProfile";
import { readClipLocations } from "#src/services/voiceMatch/reference/readClipLocations";
import { writeGeneratedJson } from "#src/services/voiceMatch/writeGeneratedJson";
import { getPersonaCardName } from "@esposter/genshin-persona/src/services/getPersonaCardName.ts";
import { readRoster } from "@esposter/genshin-persona/src/services/readRoster.ts";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { rmSync } from "node:fs";
import { basename, join } from "node:path";

// Stage 0 and 1 of the voice match benchmark: every character's clips in one language track, decoded and measured
// Into one profile each, generated one file per character under the track's language. A character the last run
// Profiled is kept, so a run after a patch measures only the characters it added. The argument is the track's folder
// Under the game's audio assets; nothing under it is copied or written anywhere
const isFresh = process.argv.includes(FRESH_FLAG);
const [audioDirectory] = process.argv.filter((argument) => argument !== FRESH_FLAG).slice(2);
if (!audioDirectory)
  throw new InvalidOperationError(
    Operation.Read,
    "voice-match:reference",
    "pass a language track's AudioAssets folder",
  );

const track = basename(audioDirectory);
const language = AUDIO_TRACK_LANGUAGES[track];
if (!language)
  throw new InvalidOperationError(
    Operation.Read,
    "voice-match:reference",
    `${track} is not a track: ${Object.keys(AUDIO_TRACK_LANGUAGES).join(", ")}`,
  );

const referenceDirectory = join(REFERENCES_DIRECTORY, language);

const clipLocationMap = readClipLocations(audioDirectory);
console.info(`${clipLocationMap.size} clips indexed`);
const decoder = await createClipDecoder();
const embed = await createSpeakerEmbedder();
const kept = readKeptRecords<CharacterReference>(referenceDirectory, isFresh);
// The folder is the run's whole output, so a character the roster no longer holds leaves no file behind
rmSync(referenceDirectory, { force: true, recursive: true });
const unprofiled: string[] = [];
let profiled = 0;
for (const { name } of readRoster()) {
  const keptReference = kept.get(name);
  if (keptReference) {
    writeGeneratedJson(referenceDirectory, getPersonaCardName(name), keptReference);
    profiled += 1;
    continue;
  }

  const profile = await readCharacterProfile(name, track, clipLocationMap, decoder, embed);
  if (!profile) {
    unprofiled.push(name);
    continue;
  }

  const reference: CharacterReference = { name, profile };
  writeGeneratedJson(referenceDirectory, getPersonaCardName(name), reference);
  profiled += 1;
  console.info(
    `${name}: ${profile.clipCount} clips, ${profile.speechSeconds.toFixed(0)} s, ${profile.medianF0Hz.toFixed(0)} Hz ± ${profile.pitchSpreadSemitones.toFixed(1)} st, ${profile.syllablesPerSecond.toFixed(1)} syl/s, ${profile.signalToNoiseDb.toFixed(0)} dB`,
  );
}

decoder.free();
console.info(`${profiled} characters profiled to ${referenceDirectory}`);
if (unprofiled.length > 0) console.info(`too few clips: ${unprofiled.join(", ")}`);
