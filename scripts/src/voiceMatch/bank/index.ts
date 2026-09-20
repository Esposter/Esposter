import type { CandidateVoice } from "#src/models/voiceMatch/CandidateVoice";

import { createTranscriber } from "#src/services/voiceMatch/bank/createTranscriber";
import { readCandidateVoice } from "#src/services/voiceMatch/bank/readCandidateVoice";
import { BANK_DIRECTORY, FRESH_FLAG, PERCENT } from "#src/services/voiceMatch/constants";
import { createSpeakerEmbedder } from "#src/services/voiceMatch/createSpeakerEmbedder";
import { readKeptRecords } from "#src/services/voiceMatch/readKeptRecords";
import { writeGeneratedJson } from "#src/services/voiceMatch/writeGeneratedJson";
import {
  SPEECH_ENDPOINT_ENVIRONMENT_VARIABLE,
  SPEECH_KEY_ENVIRONMENT_VARIABLE,
} from "@esposter/genshin-persona/src/services/constants.ts";
import { readSpeechVoiceDefinitions } from "@esposter/genshin-persona/src/services/readSpeechVoiceDefinitions.ts";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { rmSync } from "node:fs";

// Stage 2 of the voice match benchmark: the whole catalogue reading one carrier sentence, measured once and reused
// For every character, generated one file per voice. A voice the last run measured is kept as measured and only its
// Listed styles are taken again; a voice the list gained is synthesized and measured. The endpoint and key are the
// Plugin's own options, read from where a hook finds them
const isFresh = process.argv.includes(FRESH_FLAG);
const endpoint = process.env[SPEECH_ENDPOINT_ENVIRONMENT_VARIABLE] ?? "";
const key = process.env[SPEECH_KEY_ENVIRONMENT_VARIABLE] ?? "";
if (!endpoint || !key)
  throw new InvalidOperationError(Operation.Read, "voice-match:bank", "no speech endpoint and key in the environment");

const definitions = await readSpeechVoiceDefinitions(endpoint, key);
if (!definitions)
  throw new InvalidOperationError(
    Operation.Read,
    "voice-match:bank",
    "the speech resource declined to list its voices",
  );

console.info(`${definitions.length} voices listed`);
const embed = await createSpeakerEmbedder();
const transcribe = await createTranscriber();
const kept = readKeptRecords<CandidateVoice>(BANK_DIRECTORY, isFresh);
// The folder is the run's whole output, so a voice the catalogue retired leaves no file behind
rmSync(BANK_DIRECTORY, { force: true, recursive: true });
const declined: string[] = [];
let banked = 0;
let measured = 0;
for (const definition of definitions) {
  const keptCandidate = kept.get(definition.name);
  if (keptCandidate) {
    // The measured half is kept as it was; the listed half is the list's now
    const candidate: CandidateVoice = {
      name: definition.name,
      profile: keptCandidate.profile,
      styles: definition.styles,
      wordErrorRate: keptCandidate.wordErrorRate,
    };
    writeGeneratedJson(BANK_DIRECTORY, candidate.name, candidate);
    banked += 1;
    continue;
  }

  const candidate = await readCandidateVoice(definition, endpoint, key, embed, transcribe);
  if (!candidate) {
    declined.push(definition.name);
    continue;
  }

  writeGeneratedJson(BANK_DIRECTORY, candidate.name, candidate);
  banked += 1;
  measured += 1;
  const { medianF0Hz, pitchSpreadSemitones, syllablesPerSecond } = candidate.profile;
  console.info(
    `${candidate.name}: ${medianF0Hz.toFixed(0)} Hz ± ${pitchSpreadSemitones.toFixed(1)} st, ${syllablesPerSecond.toFixed(1)} syl/s, ${(candidate.wordErrorRate * PERCENT).toFixed(0)}% WER`,
  );
}

console.info(`${banked} voices banked to ${BANK_DIRECTORY}, ${measured} of them measured this run`);
if (declined.length > 0) console.info(`declined: ${declined.join(", ")}`);
