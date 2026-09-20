---
title: Voice match benchmark
description: Proposal — score every Azure voice against a character's own Japanese performance with the speech field's standard similarity metrics, so the per-character voice table is measured rather than judged. Reading the game's audio is solved; naming whose voice a clip is, is the open part.
---

# Voice Match Benchmark

[Per-character voices](/docs/infra/claude-interface/per-character-voices) ships a voice, a pitch and a rate for every character in the roster, and every one of those values was **judged** — inferred from the game's metadata and the published catalogue, with nothing listened to and nothing measured. The question it answers by taste ("which catalogue voice is closest to this character?") has an objective form, and speech synthesis research has standard metrics for exactly it.

This proposal is the measurement that replaces the taste, and the honest limits of doing so.

## What the field measures

Two metric families, standard and complementary, answering different questions. Both are needed; neither is sufficient.

**Timbre and identity — speaker embedding cosine similarity.** A speaker encoder maps an utterance to a fixed-length vector; the cosine between two vectors is the similarity score. It is the metric every voice-cloning paper reports, usually from Resemblyzer, ECAPA-TDNN or a WavLM-based verification model. Crucially for us, **it is applied across languages on purpose**: cross-lingual synthesis work scores an English synthesis against a reference in the speaker's own language, which is precisely the shape here — a Japanese performance as the target, an English candidate to rank. That is what makes "match the Japanese voice while speaking English" a well-posed question rather than a wish.

**Prosody — fundamental frequency and duration statistics.** Log-F0 RMSE is the most frequently used prosody metric in the literature. Its standard form aligns frames by dynamic time warping against _the same words_ spoken twice, which does not exist here, so this benchmark uses the **distributional** form instead: median log-F0, log-F0 standard deviation as a pitch range in semitones, and speaking rate in syllables per second. Averaged over enough speech these are content-independent, and they are exactly the two levers a card already spends.

**Mel-cepstral distortion has no place here.** It is the other metric one reaches for by reflex, and it requires parallel content. Reaching for it against non-parallel clips produces a number that means nothing.

## What the field says about trusting them

A 2025 analysis of speaker-similarity assessment documents the failure modes, and they all apply to this setup:

- Embeddings encode **spectral** traits — pitch range, timbre — and neglect rhythm and articulation, so a high score does not mean the delivery matches.
- They are confounded by **clip duration**: same-speaker utterances grouped by length score as different speakers far more often than chance.
- They are confounded by **noise and equalization**: a low signal-to-noise ratio, or a spectral tilt difference between two corpora, moves the score on its own.

The consequences are design constraints, not caveats to note and ignore:

| Constraint                                                   | Why                                                     |
| :----------------------------------------------------------- | :------------------------------------------------------ |
| Match reference and candidate clip durations                 | Duration alone discriminates                            |
| Measure signal-to-noise on both corpora before scoring       | Game audio is mastered; TTS output is clean             |
| Average the reference over several clips, never one          | A single clip scores its own recording conditions       |
| Rank on the composite, never on the embedding score alone    | Rhythm is invisible to the embedding                    |
| Validate the whole metric against the ear before applying it | Below — this is the step that makes the rest legitimate |

## Reading the reference audio — solved

Stage 0 was written as the gate the rest waited on. It is not a gate: the track decodes with two npm packages and
no external binary, and the facts below are measured rather than expected.

The Japanese voice track ships as standard Audiokinetic packages — an `AKPK` header, one external lookup table of
64-bit ids, and the clips at block offsets inside the same file. Nothing is encrypted or obfuscated. There are on
the order of a hundred and seventy packages holding tens of gigabytes, each with several hundred to a couple of
thousand clips, and the clips are single-channel Wwise Vorbis at 48 kHz.

```mermaid
flowchart LR
    Package["AKPK package<br/>externals table, 64-bit ids"]
    Clip["Wwise Vorbis clip<br/>headers stripped"]
    Ogg["Ogg Vorbis<br/>ww2ogg-ts"]
    Pcm["PCM<br/>ogg-vorbis wasm"]

    Package -->|"offset and size"| Clip
    Clip -->|"rebuild headers"| Ogg
    Ogg -->|"decode"| Pcm
```

**The codebook variant is `aoTuV_603`, and choosing wrong fails silently.** Wwise strips the Vorbis codebooks and
expects the player to supply them. The `standard` set — the library's own default — produces an Ogg stream that
throws no error, decodes to zero samples and reports its failures only in a count nobody reads. There is no
exception to catch, so the variant is not a preference to tune but a constant to assert.

**The chain was checked against a reference decoder rather than by ear**, since an agent has no ear to check it
with: the same clip through vgmstream and through the npm chain agree to 76.3 dB, which is the 16-bit
quantisation floor of the comparison and nothing else. That measurement is the reason to trust the decoder, and
re-running it is how anyone revalidates the chain after a dependency bump.

**Sampling is by voiced duration, never by byte size.** Taking the longest clips in a package selects story
dialogue and excludes the short combat and menu lines, which is the opposite of a representative sample.

## Japanese only — a rule, not a preference

**No other language track enters this pipeline at any stage**, including as a labelling convenience. Each
localisation is a different voice actor, so English audio is not weaker evidence about a character's voice — it is
evidence about a different person's, and mixing it in corrupts the reference rather than diluting it.

The shortcut it would have bought is dead anyway, which is worth recording so nobody re-derives it: the language
tracks share no clip ids at all (none of 862 in the package checked), because the ids are per-language hashes, and
their entry order correlates at about zero because packages are ordered by hash. There is no index alignment
between tracks and no id join. The rule costs nothing.

## The pipeline

```mermaid
flowchart TD
    Extract["Stage 0 — reference clips<br/>decoded, solved"]
    Profile["Stage 1 — reference profile<br/>embedding, log-F0, spread, rate"]
    Bank["Stage 2 — candidate bank<br/>one synthesis per voice, reused for the whole roster"]
    Solve["Stage 3 — pitch and rate solved from the ratio of medians<br/>no search"]
    Gate{"Inside Azure's clamp,<br/>and intelligible?"}
    Rank["Stage 4 — rank by the composite score"]
    Style["Stage 5 — style pass, top voice only"]
    Emit["Stage 6 — emit the card lines"]
    Drop["Rejected: the wrong voice,<br/>not a voice to correct"]

    Extract --> Profile
    Profile --> Solve
    Bank --> Solve
    Solve --> Gate
    Gate -- no --> Drop
    Gate -- yes --> Rank
    Rank --> Style --> Emit
```

**Stage 2 is what makes this affordable.** The candidate bank is one synthesis per voice of a fixed carrier sentence at neutral settings, and it is measured once and **reused for every character in the roster** — the bank describes the voices, not the characters.

**Stage 3 is what makes it cheap.** Pitch and rate need no search: the required shift is a ratio of two measured medians, converted to the percentage or semitone form the markup takes. A voice whose required shift falls outside Azure's clamp — half to one and a half times for pitch, half to twice for rate — is **the wrong voice rather than a voice to clamp**, and the range is a filter at this stage, not a correction.

**Which voices are candidates** is the "every language?" question, and the answer is split. Search for timbre over the whole catalogue, because speaker embeddings are largely language-independent; but the eligible pool is the English voices together with the multilingual ones, since a Japanese-locale voice reading English is unintelligible while a multilingual voice carries non-English voice talent that does speak English properly. Do not trust the naming to enforce that — **gate on measured intelligibility**, transcribing each candidate's carrier synthesis with an ASR model and rejecting on word error rate. That single gate covers every locale the catalogue may add later.

## Whose voice is this? — the part that is actually hard

Scoring is text-independent, so the words in a reference clip never matter. **Which character a clip belongs to
does**, and the packages do not say. Three routes were tried and two are dead:

| Route                                                                | Verdict                                                                       |
| :------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| One package is one character                                         | Unsupported — the sampled packages read as scene audio, not a character's set |
| Label a clip by matching its transcript to the game data's own lines | Too rare to label with, but strong enough to name with                        |
| Carry labels across from another language track                      | Dead, and banned above                                                        |

The middle row is the useful finding. The game data carries thousands of Japanese voice-over lines across nearly a
hundred characters, and transcribing a clip and matching it against them **almost always fails**: across eight
sampled packages, seven produced nothing above chance and one produced a clear, unmistakable hit. A match is real
when it happens and it happens about once in a dozen clips.

That rules the corpus out as a per-clip labeller and rules it _in_ as something better, because of what the
embedding already gives for free:

```mermaid
flowchart TD
    Clips["Sampled clips<br/>no labels"]
    Embed["Embed every clip"]
    Cluster["Cluster by voice<br/>one cluster is one speaker"]
    Name["Transcribe a few per cluster<br/>until one line matches"]
    Labelled["A named reference set<br/>per character"]
    Unnamed["Unnamed cluster<br/>parked, not guessed"]

    Clips --> Embed --> Cluster --> Name
    Name -->|"a confident match"| Labelled
    Name -->|"nothing matches"| Unnamed
```

**Cluster first, then name.** A cluster needs one confident match, not one per clip, so a hit rate of one in a
dozen is ample rather than fatal. It also holds whatever the packages turn out to be: the clustering never assumes
a package is a character, so the question that blocked the other two routes stops mattering. A cluster nothing
matches is parked rather than guessed at — an unnamed voice costs one character's tuning, a misnamed one silently
writes the wrong voice into a card.

## What it costs

Stage 2 is a hundred-odd voices against a carrier sentence: tens of thousands of characters, once, ever. Stage 5 is the only per-character synthesis — the roster against its chosen voice's declared styles — on the order of a hundred thousand characters. Both sit inside the monthly allowance the [spoken replies](/docs/infra/claude-interface/spoken-replies) account already has, which is the whole reason this is worth running rather than admiring.

A naive grid search is what this design exists to avoid: every voice against every pitch step against every rate step, per character, is millions of characters and buys nothing that stage 3 does not compute exactly.

## The number to tune

**Mean composite score across the roster** is the headline, and the thing a weighting change is judged by. Two diagnostics have to be reported beside it, because the mean hides both failure modes:

- **The count below a floor** — the characters the benchmark could not fit, which are the ones that still need the ear.
- **The spread of chosen voices** — a run that lands most of the roster on a handful of voices has found a degenerate optimum, not a fit, and the mean will look fine while it does.

## Validating the benchmark before trusting it

Non-optional, and standard practice: a metric is only worth its ranking if the ranking agrees with a person. Take a sample of characters, synthesize the top three candidates for each, rank them by ear, and compute the rank correlation against the composite score. Agreement is the licence to apply the benchmark to the rest of the roster. Disagreement means the weights are wrong — and the weights are then tuned **on that sample only**, never on the whole roster, which would be fitting the metric to its own output.

## The toolchain, and where it lives

**Node first, and everything proven so far is Node.** The package parsing and the decode are `ww2ogg-ts`
(BSD-3-Clause, no runtime dependencies, codebooks embedded) and a WebAssembly Ogg Vorbis decoder — both npm, both
pinned by a lockfile, both reproducible by anyone who clones the repo. The remaining stages have Node answers
worth trying before anything else: transformers.js runs an ASR model in process, the ONNX runtime has a Node
binding for a speaker encoder, and F0 is a published pure-JavaScript library or fifty lines of autocorrelation.

A Python environment was started for these and abandoned. It is recorded only so the next session does not repeat
it: it buys the better-known implementations and costs a second toolchain that nothing else here needs, and on
Windows a virtual environment created under a deep temporary path fails to install at all on path length.

**What is committed and what is not.** The package reader and the decoder belong in the repository's own tooling
package, because they are the part that would otherwise be re-derived. The decoded clips never are — they are
game audio, the published plugin states it carries none, and the rule holds for a cache exactly as it holds for a
commit. The clips live outside the repository and only the numbers they produce come back in.

## Key files

| File                                                             | Change                                             |
| :--------------------------------------------------------------- | :------------------------------------------------- |
| `packages/genshin-persona/src/personaCards/`                     | The `voice` field each run rewrites                |
| `scripts/src/`                                                   | Where the package reader and decoder belong        |
| `packages/genshin-persona/src/services/getSpeechVoiceFinding.ts` | Still the check that a written line is well-formed |

## Notes

- The benchmark does not remove the ear from the loop; it changes what the ear is asked to do, from auditioning a hundred-odd voices per character to confirming three.
- Stage 0 is shared with the deferred character-voice stage, and this proposal is the cheaper half of it: choosing a catalogue voice needs no inference engine, only the reference audio. That audio now decodes, so this proposal is no longer blocked on anything outside itself.
- An agent can build and run every stage except two: the listening in the validation step, and the judgement of whether a degenerate spread is acceptable. Both are the person's.
