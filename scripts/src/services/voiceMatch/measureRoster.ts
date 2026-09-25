import type { PersonaReference } from "@esposter/genshin-persona/src/models/PersonaReference.ts";
import type { VoiceLanguage } from "@esposter/genshin-persona/src/models/VoiceLanguage.ts";

import { MODELS_DIRECTORY, PERSONA_REFERENCE_MAP_PATH } from "#src/services/voiceMatch/constants";
import { createSpeakerEmbedder } from "#src/services/voiceMatch/createSpeakerEmbedder";
import { getPersonaReferenceMapSource } from "#src/services/voiceMatch/getPersonaReferenceMapSource";
import { measureCharacterReference } from "#src/services/voiceMatch/measureCharacterReference";
import { PersonaReferenceMap } from "@esposter/genshin-persona/src/generated/PersonaReferenceMap.ts";
import { DEFAULT_LANGUAGE } from "@esposter/genshin-persona/src/services/constants.ts";
import { createClipDecoder } from "@esposter/genshin-persona/src/services/createClipDecoder.ts";
import { createVoiceSynthesizer } from "@esposter/genshin-persona/src/services/createVoiceSynthesizer.ts";
import { readRoster } from "@esposter/genshin-persona/src/services/readRoster.ts";
import { readVoiceRuntime } from "@esposter/genshin-persona/src/services/readVoiceRuntime.ts";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { writeFileSync } from "node:fs";

// The reference selection: for every roster character — or the ones named — in one dub, the story line that best
// Represents their voice and the likeness of the clone made from it, printed per character and — with `--write` —
// Generated into the plugin as one map. A run over the whole roster writes the map whole; one over named characters
// Writes their entries into it and keeps the rest. Nothing under the wiki's files is written anywhere
export const measureRoster = async (language: VoiceLanguage, names: string[], isWriting: boolean): Promise<void> => {
  // The English roster, whatever the interface language is set to: every name here is the identity the map, the
  // Cards and the wiki's files are keyed by, and nothing a localized roster carries is read
  const wholeRoster = readRoster(DEFAULT_LANGUAGE);
  const unknownNames = names.filter((name) => !wholeRoster.some((character) => character.name === name));
  if (unknownNames.length > 0)
    throw new InvalidOperationError(Operation.Read, "voice-match", `not on the roster: ${unknownNames.join(", ")}`);

  const embed = await createSpeakerEmbedder();
  const decoder = await createClipDecoder();
  const runtime = readVoiceRuntime(import.meta.url);
  const synthesizer = await createVoiceSynthesizer(runtime, MODELS_DIRECTORY, { onFallback: console.info });
  console.info(`engine on ${synthesizer.device}`);
  const roster = names.length > 0 ? wholeRoster.filter(({ name }) => names.includes(name)) : wholeRoster;
  const references = new Map<string, PersonaReference>(names.length > 0 ? Object.entries(PersonaReferenceMap) : []);
  const unmeasured: string[] = [];
  for (const { name } of roster) {
    // oxlint-disable-next-line no-await-in-loop -- One device: every measurement synthesizes on the one model session
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
