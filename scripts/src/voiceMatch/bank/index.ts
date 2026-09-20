import type { CandidateVoice } from "#src/models/voiceMatch/CandidateVoice";

import { createTranscriber } from "#src/services/voiceMatch/bank/createTranscriber";
import { readCandidateVoice } from "#src/services/voiceMatch/bank/readCandidateVoice";
import { BANK_PATH, JSON_INDENT, WORK_DIRECTORY } from "#src/services/voiceMatch/constants";
import { createSpeakerEmbedder } from "#src/services/voiceMatch/createSpeakerEmbedder";
import {
  SPEECH_ENDPOINT_ENVIRONMENT_VARIABLE,
  SPEECH_KEY_ENVIRONMENT_VARIABLE,
} from "@esposter/genshin-persona/src/services/constants.ts";
import { readSpeechVoiceDefinitions } from "@esposter/genshin-persona/src/services/readSpeechVoiceDefinitions.ts";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, writeFileSync } from "node:fs";

const PERCENT = 100;

// Stage 2 of the voice match benchmark: the whole catalogue reading one carrier sentence, measured once and reused
// For every character. The endpoint and key are the plugin's own options, read from where a hook finds them
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
const candidates: CandidateVoice[] = [];
const declined: string[] = [];
mkdirSync(WORK_DIRECTORY, { recursive: true });
for (const definition of definitions) {
  const candidate = await readCandidateVoice(definition, endpoint, key, embed, transcribe);
  if (!candidate) {
    declined.push(definition.name);
    continue;
  }

  candidates.push(candidate);
  // Written as it goes: the run is the better part of an hour, and a voice the service times out on should not
  // Cost the ones before it
  writeFileSync(BANK_PATH, JSON.stringify(candidates, undefined, JSON_INDENT));
  const { medianF0Hz, pitchSpreadSemitones, syllablesPerSecond } = candidate.profile;
  console.info(
    `${candidate.name}: ${medianF0Hz.toFixed(0)} Hz ± ${pitchSpreadSemitones.toFixed(1)} st, ${syllablesPerSecond.toFixed(1)} syl/s, ${(candidate.wordErrorRate * PERCENT).toFixed(0)}% WER`,
  );
}

console.info(`${candidates.length} voices banked to ${BANK_PATH}`);
if (declined.length > 0) console.info(`declined: ${declined.join(", ")}`);
