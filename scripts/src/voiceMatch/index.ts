import type { PersonaReference } from "@esposter/genshin-persona/src/models/PersonaReference.ts";

import {
  CHECK_FLAG,
  MODELS_DIRECTORY,
  PERSONA_REFERENCE_MAP_PATH,
  WRITE_FLAG,
} from "#src/services/voiceMatch/constants";
import { createSpeakerEmbedder } from "#src/services/voiceMatch/createSpeakerEmbedder";
import { getPersonaReferenceMapSource } from "#src/services/voiceMatch/getPersonaReferenceMapSource";
import { measureCharacterReference } from "#src/services/voiceMatch/measureCharacterReference";
import { readMissingReferences } from "#src/services/voiceMatch/readMissingReferences";
import { PersonaReferenceMap } from "@esposter/genshin-persona/src/generated/PersonaReferenceMap.ts";
import { VoiceLanguage } from "@esposter/genshin-persona/src/models/VoiceLanguage.ts";
import { checkIsVoiceLanguage } from "@esposter/genshin-persona/src/services/checkIsVoiceLanguage.ts";
import { createClipDecoder } from "@esposter/genshin-persona/src/services/createClipDecoder.ts";
import { createVoiceSynthesizer } from "@esposter/genshin-persona/src/services/createVoiceSynthesizer.ts";
import { readCardedRoster } from "@esposter/genshin-persona/src/services/readCardedRoster.ts";
import { readCharacterReference } from "@esposter/genshin-persona/src/services/readCharacterReference.ts";
import { readRoster } from "@esposter/genshin-persona/src/services/readRoster.ts";
import { readVoiceRuntime } from "@esposter/genshin-persona/src/services/readVoiceRuntime.ts";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { writeFileSync } from "node:fs";

// The reference selection: for every roster character — or the ones named — in one dub, the story line that best
// Represents their voice and the likeness of the clone made from it, printed per character and — with `--write` —
// Generated into the plugin as one map. A run over the whole roster writes the map whole; one over named characters
// Writes their entries into it and keeps the rest. Nothing under the wiki's files is written anywhere
const measureRoster = async (language: VoiceLanguage, names: string[], isWriting: boolean) => {
  const wholeRoster = readRoster();
  const unknownNames = names.filter((name) => !wholeRoster.some((character) => character.name === name));
  if (unknownNames.length > 0)
    throw new InvalidOperationError(Operation.Read, "voice-match", `not on the roster: ${unknownNames.join(", ")}`);

  const embed = await createSpeakerEmbedder();
  const decoder = await createClipDecoder();
  const runtime = readVoiceRuntime(import.meta.url);
  const synthesizer = await createVoiceSynthesizer(runtime, MODELS_DIRECTORY);
  console.info(`engine on ${synthesizer.device}`);
  const roster = names.length > 0 ? wholeRoster.filter(({ name }) => names.includes(name)) : wholeRoster;
  const references = new Map<string, PersonaReference>(names.length > 0 ? Object.entries(PersonaReferenceMap) : []);
  const unmeasured: string[] = [];
  for (const { name } of roster) {
    const measurement = await measureCharacterReference(name, language, decoder, embed, synthesizer);
    if (!measurement) {
      unmeasured.push(name);
      continue;
    }

    const { clipCount, reference, referenceSeconds, referenceSignalToNoiseDb } = measurement;
    references.set(name, reference);
    console.info(
      `${name}: ${reference.stem} — likeness ${reference.likeness} (${clipCount} clips; reference ${referenceSeconds.toFixed(1)} s, ${referenceSignalToNoiseDb.toFixed(0)} dB)`,
    );
  }

  decoder.free();
  console.info(`${roster.length - unmeasured.length} of ${roster.length} characters measured in ${language}`);
  if (unmeasured.length > 0) console.info(`too few usable clips: ${unmeasured.join(", ")}`);
  if (isWriting) {
    writeFileSync(PERSONA_REFERENCE_MAP_PATH, getPersonaReferenceMapSource(references));
    console.info(`map generated to ${PERSONA_REFERENCE_MAP_PATH}`);
  }
};
// `--check` measures nothing: it asks the wiki whether the line each character is read from — the card's, else
// The map's — is still a file in every dub, since a stem measured in one dub serves the others by the template's
// Rule, and a line renamed or never dubbed is a character the plugin would fall silent on
const checkReferences = async () => {
  const cardedRoster = await readCardedRoster(readRoster());
  const stems = new Map(
    cardedRoster.map(({ character, personaCard }) => [
      character.name,
      readCharacterReference(character.name, personaCard),
    ]),
  );
  const unreferenced = [...stems].filter(([, stem]) => !stem).map(([name]) => name);
  const referenced = new Map([...stems].filter(([, stem]) => stem));
  const missing = await readMissingReferences(referenced);
  for (const line of missing) console.info(line);
  if (unreferenced.length > 0)
    console.info(`read from the longest story line, no reference: ${unreferenced.join(", ")}`);
  console.info(
    `${referenced.size} of ${stems.size} characters' references checked in every dub, ${missing.length} missing`,
  );
  process.exitCode = missing.length > 0 ? 1 : 0;
};

// The dub first, then any characters to measure alone; the flags anywhere
const flags = new Set([CHECK_FLAG, WRITE_FLAG]);
const [language = VoiceLanguage.English, ...names] = process.argv.slice(2).filter((argument) => !flags.has(argument));
if (!checkIsVoiceLanguage(language))
  throw new InvalidOperationError(
    Operation.Read,
    "voice-match",
    `${language} is not a dub: ${Object.values(VoiceLanguage).join(", ")}`,
  );

if (process.argv.includes(CHECK_FLAG)) await checkReferences();
else await measureRoster(language, names, process.argv.includes(WRITE_FLAG));
