import type { CharacterReference } from "#src/models/voiceMatch/CharacterReference";

import { REFERENCE_DIRECTORY } from "#src/services/voiceMatch/constants";
import { createSpeakerEmbedder } from "#src/services/voiceMatch/createSpeakerEmbedder";
import { createClipDecoder } from "#src/services/voiceMatch/reference/createClipDecoder";
import { readCharacterProfile } from "#src/services/voiceMatch/reference/readCharacterProfile";
import { readClipLocations } from "#src/services/voiceMatch/reference/readClipLocations";
import { writeGeneratedJson } from "#src/services/voiceMatch/writeGeneratedJson";
import { getPersonaCardName } from "@esposter/genshin-persona/src/services/getPersonaCardName.ts";
import { readRoster } from "@esposter/genshin-persona/src/services/readRoster.ts";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { rmSync } from "node:fs";

// Stage 0 and 1 of the voice match benchmark: every character's Japanese clips, decoded and measured into one
// Profile each, generated one file per character. The argument is the game's Japanese audio folder; nothing under
// It is copied or written anywhere
const [audioDirectory] = process.argv.slice(2);
if (!audioDirectory)
  throw new InvalidOperationError(Operation.Read, "voice-match:reference", "pass the Japanese AudioAssets folder");

const clipLocationMap = readClipLocations(audioDirectory);
console.info(`${clipLocationMap.size} clips indexed`);
const decoder = await createClipDecoder();
const embed = await createSpeakerEmbedder();
// The folder is the run's whole output, so a character the roster no longer holds leaves no file behind
rmSync(REFERENCE_DIRECTORY, { force: true, recursive: true });
const unprofiled: string[] = [];
let profiled = 0;
for (const { name } of readRoster()) {
  const profile = await readCharacterProfile(name, clipLocationMap, decoder, embed);
  if (!profile) {
    unprofiled.push(name);
    continue;
  }

  const reference: CharacterReference = { name, profile };
  writeGeneratedJson(REFERENCE_DIRECTORY, getPersonaCardName(name), reference);
  profiled += 1;
  console.info(
    `${name}: ${profile.clipCount} clips, ${profile.speechSeconds.toFixed(0)} s, ${profile.medianF0Hz.toFixed(0)} Hz ± ${profile.pitchSpreadSemitones.toFixed(1)} st, ${profile.syllablesPerSecond.toFixed(1)} syl/s, ${profile.signalToNoiseDb.toFixed(0)} dB`,
  );
}

decoder.free();
console.info(`${profiled} characters profiled to ${REFERENCE_DIRECTORY}`);
if (unprofiled.length > 0) console.info(`too few clips: ${unprofiled.join(", ")}`);
