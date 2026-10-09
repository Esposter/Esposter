---
title: Seamless spoken replies
description: Proposal — first sound within a fraction of a second of a spoken line being written, by vocoding a line in chunks as its speech tokens are made rather than once after its last. Both stages are built; the as-built page carries the streaming and its measurements, and this page keeps the decisions and what is left.
model: claude-fable-5-1
---

# Seamless spoken replies

Both stages are built: a line's first sound is one chunk after its speech tokens begin, not its whole synthesis. The as-built description, the streaming's shape and the measurements are on the [spoken replies](/docs/infra/claude-interface/spoken-replies) page, under Streaming a line. What follows is the decisions made to build it, and what is left, which is nothing.

## Scope

**Today:** one engine, Chatterbox Nano through the ONNX runtime, its language model on WebGPU and its vocoder on DirectML, which the top rung runs and the CPU rung falls back from. Each line is streamed: the language model streams its speech tokens, and every 13 of them the tokens so far are vocoded and the new audio yielded to the player. The numbers are in the committed bench beside the [reference selection](/docs/infra/claude-interface/reference-selection), `scripts/src/voiceMatch/synthesizer.bench.md`.

**Two stages**, each a property that can be measured:

1. **Never pausing.** Synthesis faster than playback with headroom. It holds on this machine: the language model on WebGPU and the vocoder on DirectML take about 6.6x less CPU than before, so a line reads faster than real time.
2. **First sound within a fraction of a second** of the line being written. Built: the first sound is the first chunk, 0.51 s of speech after about 1.2 s of generation and vocode on this laptop, against a whole-line wait of 1.9 to 3.0 s for the sentences measured.

## Decisions

- **A chunk that is not speech** plays what already passed, drops the rest of that line, moves the ladder down once, and logs one line naming the reply, the line and the chunk. Nothing is re-synthesized mid-reply.
- **The replayed prefix.** Each pass vocodes every token so far, so the splicer keeps the count emitted, holds back the last 10 ms of each pass, and fades it into the next pass over the same samples. Only the new audio is emitted.
- **The chunk size** is 13 speech tokens, `VOICE_CHUNK_TOKENS`, which measures as 0.51 s of audio on the first chunk of each sentence measured.
- **The decoder's padding** is never played: a non-final pass ends at its speech share, since the decoder pads each pass with three silence tokens.
- **The speech check** reads the chunk's own samples, not the seam.
- **The player** needs no change: the existing player already plays one WAV per clip in sequence, so a chunk is a clip.

## What this does not propose

- **Dropping the clone for speed.** A catalogue voice reads faster on any hardware; the persona is the character's own voice or it is nothing.
- **Two lines in flight.** Measured and rejected on the [spoken replies](/docs/infra/claude-interface/spoken-replies) page: the vocoder's threads take every core, so the language model gains nothing from running beside it.
- **A stock line played to cover the wait.** A bark that is not the reply's own line is a fake, and nothing is made ahead.

## Left

Nothing. The [multilingual spoken replies](/docs/proposals/infra/multilingual-spoken-replies) proposal shares the chunking and the player when it lands, and is its own proposal.

## Key files

| File                                                              | Role                                                                                         |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `scripts/src/voiceMatch/synthesizer.bench.ts`                     | The instrument: whole-line and first-sound tasks per sentence shape; off once committed      |
| `packages/genshin-persona/src/services/createVoiceSynthesizer.ts` | `streamSpeech`: the streamer, each chunk's speech check, the ladder's move on a failed chunk |
| `packages/genshin-persona/src/services/createChunkSplicer.ts`     | The seam: held back, crossfaded, and the count emitted kept                                  |
| `packages/genshin-persona/src/services/vocodeSpeechTokens.ts`     | The decoder run over the tokens so far                                                       |
| `packages/genshin-persona/scripts/voice.ts`                       | The reading plays each chunk as it lands, under the one-turn-pending rule                    |
| `packages/genshin-persona/src/services/constants.ts`              | `VOICE_CHUNK_TOKENS`, the crossfade, the decoder's silence tokens                            |

## Sources

- [chatterbox-streaming](https://github.com/davidbrowne17/chatterbox-streaming) — vocoding a line in chunks as its speech tokens are made, the technique stage 2 takes.
