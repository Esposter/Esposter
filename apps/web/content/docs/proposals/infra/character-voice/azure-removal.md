---
title: Azure removal
description: Proposal — everything the Azure Speech path owns and the order it can be removed in: the protected account and its key output in Pulumi, the three plugin options, the markup and catalogue code, the generated voice table, the benchmark's catalogue stages, and the pages that describe them.
---

# Azure removal

The cloned voice makes every part of the Azure path an approximation of itself, so the whole path goes — no adapter kept "in case", because the [Claude interface](/docs/infra/claude-interface)'s rollback plan is git, not a second code path. What follows is the inventory, grouped by the order it can be removed in without a broken step between.

## 1. The estate

The speech account is a protected resource, so its removal is two applies rather than one: the first turns `protect` off, the second deletes the resource and its key output and destroys the account. Both are previewed first, as every apply here is. The account is free-tier, so nothing in the cost guard moves; the outputs folder is left empty, and the `pulumi-infra` skill's example of an output file is rewritten for a folder that then holds none.

| File                                                                                         | Action                 |
| :------------------------------------------------------------------------------------------- | :--------------------- |
| `apps/infra/src/azure/resources/Microsoft.CognitiveServices/accounts/prodSpchEsposter001.ts` | delete                 |
| `apps/infra/src/azure/outputs/prodSpchEsposter001Key.ts`                                     | delete                 |
| `apps/infra/src/index.ts`                                                                    | drop both barrel lines |

## 2. The plugin

**Options.** The manifest loses `speech_endpoint`, `speech_key` and `speech_voice`; the language is a state file written by the `voice` verb, not an option, because an option reaches a hook as an environment variable and a verb that switches it would then have nothing to write. The key a person stored stays in their credential store until they clear it through the plugin's configure dialog — the plugin cannot reach it, and the README says so.

**Code.** Everything that spoke the markup or read the catalogue:

| File                                                                  | Fate                                                                            |
| :-------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| `packages/genshin-persona/src/services/synthesizeSpeech.ts`           | replaced by one request to the synthesizer                                      |
| `packages/genshin-persona/src/services/getSsml.ts`                    | delete, with its test and `escapeXml`, its only caller                          |
| `packages/genshin-persona/src/services/getSpeechUrl.ts`               | delete                                                                          |
| `packages/genshin-persona/src/services/readSpeechVoiceDefinitions.ts` | delete                                                                          |
| `packages/genshin-persona/src/services/getSpeechVoiceFinding.ts`      | delete, with its test; the `voices` verb goes with it                           |
| `packages/genshin-persona/src/services/checkIsSpeechVolume.ts`        | becomes a whole-number check: the named levels were the markup's                |
| `packages/genshin-persona/src/services/readPersonaVoice.ts`           | becomes the reference module reader                                             |
| `packages/genshin-persona/src/services/readCharacterVoice.ts`         | the card's reference over the generated one — same precedence, new field        |
| `packages/genshin-persona/src/models/SpeechVoice.ts`                  | becomes the card's `reference` and `exaggeration`                               |
| `packages/genshin-persona/src/models/SpeechRequest.ts`                | becomes the synthesizer's request                                               |
| `packages/genshin-persona/src/models/SpeechVoiceDefinition.ts`        | delete                                                                          |
| `packages/genshin-persona/src/models/SpeechVoiceListEntry.ts`         | delete                                                                          |
| `packages/genshin-persona/src/generated/personaVoices/`               | delete — the reference modules replace it                                       |
| `packages/genshin-persona/src/services/constants.ts`                  | the speech endpoint, key, voice, path, format, namespace and level constants go |

The volume verb keeps its scale — a whole number up to the declared maximum — and drops the named levels, since they were the markup's vocabulary. The `volume` file on disk is unchanged for anyone who wrote a number.

**Manifest.** The `azure-speech` keyword goes from both manifests, the descriptions stop naming the service, and the plugin gains the one Vorbis decoder the reference clip needs.

## 3. The benchmark

The [voice match benchmark](/docs/infra/claude-interface/voice-match-benchmark) goes whole: its catalogue half has nothing left to measure, and its game-install half is replaced by the wiki-fed runner of [reference selection](/docs/proposals/infra/character-voice/reference-selection), which keeps only the per-clip measurement:

| Path                                         | Fate                                                                                            |
| :------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| `scripts/src/voiceMatch/bank/`               | delete — the carrier sentence through the service, the transcriber and its word-error gate      |
| `scripts/src/voiceMatch/rank/`               | delete — the composite fit and the voice-table writer                                           |
| `scripts/src/services/voiceMatch/bank/`      | delete                                                                                          |
| `scripts/src/services/voiceMatch/rank/`      | delete, except the cosine, which the likeness uses                                              |
| `scripts/src/generated/voiceMatch/`          | delete — the catalogue profiles and the character profiles, neither read by anything after this |
| `scripts/src/voiceMatch/reference/`          | delete — the package index, the hash and the Wwise decoding go with the game install            |
| `scripts/src/services/voiceMatch/reference/` | delete, except the frame analysis and resampling the runner still measures a clip with          |

The three package scripts go and one new one replaces them; the transcriber model and its constants go with the word-error gate, and the `ww2ogg-ts` decoder leaves the catalog since nothing reads the game's packages any more. A removed script is a removed citation, so `pnpm ai:citations:sync` runs after it.

## 4. The pages

The deferred page this proposal replaces is already gone — a proposal and a deferred page for one idea is two statuses for one thing — and every page that pointed at it now points here. The pages below describe the Azure path and are rewritten as the code ships, in the same change:

| Page                                                                    | After                                                                                                       |
| :---------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| `apps/web/content/docs/infra/claude-interface/spoken-replies.md`        | rewritten as-built: the hook, the resident synthesizer, the gate                                            |
| `apps/web/content/docs/infra/claude-interface/per-character-voices.md`  | rewritten: the reference per character, the card's field, the precedence                                    |
| `apps/web/content/docs/infra/claude-interface/voice-match-benchmark.md` | rewritten as the reference selection runner                                                                 |
| `apps/web/content/docs/infra/claude-interface/index.md`                 | stage 3 built; its gate answered by the engine's one-command install; the `voice` verb in the surface table |
| `apps/web/content/docs/infra/claude-interface/persona-plugin.md`        | the install paragraph's promise about the voice, now kept by the state directory                            |
| `apps/web/content/docs/architecture/generated-artifacts.md`             | the rows and the precedence example name the reference modules                                              |
| `apps/web/content/docs/infra/index.md`                                  | the shipped log line names the stage                                                                        |
| `apps/web/content/docs/infra/roadmap.md`                                | the benchmark's ear item becomes this proposal's item, then goes                                            |
| `.agents/skills/package-scripts/references/ai-scripts.md`               | the two deleted scripts go, the renamed one is described                                                    |
| `.agents/skills/pulumi-infra/SKILL.md`                                  | the outputs example                                                                                         |
| `packages/genshin-persona/README.md` and the root `README.md`           | the speech section becomes the `voice` verb; the description stops naming the service                       |

## Notes

- The order matters once: the estate first, because a plugin without options is silent either way while an account nobody reads is still a resource; then the plugin and the benchmark in one change, since the reference modules the plugin reads are what the repurposed stage writes; then the pages, in the same change as the code they describe.
- Nothing here is kept behind a flag. A person who wants the catalogue voice back checks out the commit before this one; the plugin's rollback has always been git.
