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

// The reference selection: for every roster character, in one dub, the story line that best represents their
// Voice and the likeness of the clone made from it, printed per character and — with `--write` — generated into the
// Plugin as one map. Every run measures the roster whole; nothing under the wiki's files is written anywhere
const measureRoster = async (language: VoiceLanguage, isWriting: boolean) => {
  const embed = await createSpeakerEmbedder();
  const decoder = await createClipDecoder();
  const runtime = readVoiceRuntime(import.meta.url);
  const synthesizer = await createVoiceSynthesizer(runtime, MODELS_DIRECTORY);
  console.info(`engine on ${synthesizer.device}`);
  const roster = readRoster();
  const references = new Map<string, PersonaReference>();
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
  console.info(`${references.size} of ${roster.length} characters measured in ${language}`);
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

const flags = new Set([CHECK_FLAG, WRITE_FLAG]);
const [language = VoiceLanguage.English] = process.argv.slice(2).filter((argument) => !flags.has(argument));
if (!checkIsVoiceLanguage(language))
  throw new InvalidOperationError(
    Operation.Read,
    "voice-match",
    `${language} is not a dub: ${Object.values(VoiceLanguage).join(", ")}`,
  );

if (process.argv.includes(CHECK_FLAG)) await checkReferences();
else await measureRoster(language, process.argv.includes(WRITE_FLAG));
