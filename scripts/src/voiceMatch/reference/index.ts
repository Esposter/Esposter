import type { CharacterReference } from "#src/models/voiceMatch/CharacterReference";

import { JSON_INDENT, REFERENCE_PATH, WORK_DIRECTORY } from "#src/services/voiceMatch/constants";
import { createSpeakerEmbedder } from "#src/services/voiceMatch/createSpeakerEmbedder";
import { createClipDecoder } from "#src/services/voiceMatch/reference/createClipDecoder";
import { readCharacterProfile } from "#src/services/voiceMatch/reference/readCharacterProfile";
import { readClipLocations } from "#src/services/voiceMatch/reference/readClipLocations";
import { readRoster } from "@esposter/genshin-persona/src/services/readRoster.ts";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, writeFileSync } from "node:fs";

// Stage 0 and 1 of the voice match benchmark: every character's Japanese clips, decoded and measured into one
// Profile each. The argument is the game's Japanese audio folder; nothing under it is copied or written anywhere
const [audioDirectory] = process.argv.slice(2);
if (!audioDirectory)
  throw new InvalidOperationError(Operation.Read, "voice-match:reference", "pass the Japanese AudioAssets folder");

const clipLocationMap = readClipLocations(audioDirectory);
console.info(`${clipLocationMap.size} clips indexed`);
const decoder = await createClipDecoder();
const embed = await createSpeakerEmbedder();
const references: CharacterReference[] = [];
const unprofiled: string[] = [];
for (const { name } of readRoster()) {
  const profile = await readCharacterProfile(name, clipLocationMap, decoder, embed);
  if (!profile) {
    unprofiled.push(name);
    continue;
  }

  references.push({ name, profile });
  console.info(
    `${name}: ${profile.clipCount} clips, ${profile.speechSeconds.toFixed(0)} s, ${profile.medianF0Hz.toFixed(0)} Hz ± ${profile.pitchSpreadSemitones.toFixed(1)} st, ${profile.syllablesPerSecond.toFixed(1)} syl/s, ${profile.signalToNoiseDb.toFixed(0)} dB`,
  );
}

decoder.free();
mkdirSync(WORK_DIRECTORY, { recursive: true });
writeFileSync(REFERENCE_PATH, JSON.stringify(references, undefined, JSON_INDENT));
console.info(`${references.length} characters profiled to ${REFERENCE_PATH}`);
if (unprofiled.length > 0) console.info(`too few clips: ${unprofiled.join(", ")}`);
