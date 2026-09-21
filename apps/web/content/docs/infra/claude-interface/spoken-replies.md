---
title: Spoken replies
description: Stages 2 and 3 of the Claude interface as built — an asynchronous Stop hook that hands each reply's prose to a resident synthesizer on this machine, which reads it in units — the first sentence alone, then a few sentences at a time — in the character's own cloned voice through Chatterbox on the first device that speaks, playing each unit through one player process while the next is generated; the voice verb that installs the engine into the plugin's state directory; and the gates that keep a machine without one, or a session that would hear nothing, from doing the work at all.
---

# Spoken replies

Stages 2 and 3 of the [Claude interface](/docs/infra/claude-interface): a reply is heard, in the voice of the character speaking it, from an engine that runs on this machine with no service behind it. Which line of a character's own performance the voice is cloned from is the [per-character voices](/docs/infra/claude-interface/per-character-voices) page's; this page is the hook, the process it talks to, the verb that installs the engine, and the gate.

Stage 2 shipped first through an Azure Speech free-tier account and a catalogue voice bent by pitch and rate, because a cloned voice needed an inference engine with a Python environment to keep alive. That gate closed when Transformers.js shipped Chatterbox — an MIT zero-shot voice cloner — as a native model class runnable from Node on the WebGPU provider, and the whole Azure path went with it: the account, its key, the markup, the catalogue benchmark. The rollback is git.

## How it works

1. **The Stop hook** — asynchronous, so the prompt never waits — takes the reply text, strips code blocks, tables and markup, and sends what prose is left over a local socket as one JSON line: the session's character, the line their voice is cloned from, the dub, the prose and the volume. The whole of the prose, because the reading is streamed rather than waited on. It reads who the session speaks as from what the session start already recorded, never by picking again.
2. **The resident synthesizer** — one process per machine, spawned detached by whichever hook finds no server listening — holds the loaded engine. It binds the socket before the engine loads, so a second hook finds the address taken rather than loading a second engine, and a request arriving during the load waits for it. Per request it fetches the character's reference clip on first use and encodes it once per process, then **reads the prose in units** — the first sentence alone, then sentences packed to a budget of about forty words, where [NVIDIA's Chatterbox integration](https://docs.nvidia.com/ace-for-games/chatterbox-tts/programming-guide-tts-chatterbox.html) chunks long text too — each synthesized, checked for speech, given the volume as a gain and handed to one player process spawned for the reading, while the unit after it is already being generated. The first sound arrives after one sentence's synthesis rather than the whole reply's; the units after it are longer because every unit pays the reference's own tokens through the language model and the vocoder again, and because a sentence read on its own carries none of the pitch or pace of the one before it. It keeps **one pending request**: a reply that lands while another is being read replaces any reply still waiting, and tells the reading already under way, which stops at the unit boundary it has reached rather than finishing over its replacement. Idle for half an hour, it exits and frees the GPU.
3. **The SessionStart hook** spawns a detached warm request for the session's character, so the load and the first-synthesis cost are paid while the person reads the card and types, not on the first reply. The hook itself waits on nothing: its stdout is the model's context.
4. **The gates** are the dub file the `voice` verb writes — a machine that never ran it has no engine, and every hook returns at once — and whether the session would hear anything at all. `mute` and `unmute` are a second flag file, and a `volume` of zero counts as the same silence, since it is a gain that multiplies every sample away. Both are checked before a reply is sent **and** before the session start wakes the engine, because every cost of a spoken reply — the reference fetch, the graph load, every token — is paid before the gain is ever applied. `volume` is otherwise a whole number of a scale of a hundred.

```mermaid
sequenceDiagram
    participant Start as SessionStart hook
    participant Server as Resident synthesizer
    participant Stop as Stop hook (async)
    participant Wiki as Community wiki
    participant Player as Player process, one per reading

    Start->>Server: warm — this session's character (detached, nothing waited)
    Server->>Server: bind the socket, attach the handler, load the engine on the rung on file, else the top
    Server->>Wiki: the reference clip, once, cached under the state directory
    Server->>Server: encode the reference, one short synthesis
    Stop->>Server: speak — character, stem, dub, the reply's prose, volume
    Server->>Player: spawn, its start paid under the first unit's synthesis
    loop each unit, generated while the one before it plays
        Server->>Server: synthesize the newest pending request's next unit
        Server->>Server: not speech — one rung down the device ladder, again, the rung kept on file
        Server->>Server: apply the gain
        Server->>Player: a WAV's path on stdin, one line back once played, the file deleted
    end
    Server->>Player: stdin ends, the process exits
    Note over Server: a newer reply waiting — stop at this unit boundary
    Note over Server: idle for half an hour — exit, freeing the GPU
```

The protocol is one JSON line in and one status line back — `ok` and the rung the engine speaks on, `error`, or `superseded` for a request a newer one replaced — so the server can be tried from a shell with nothing but the socket path: a named pipe on Windows, a socket file in the state directory elsewhere, and no port to collide on.

## The engine

Chatterbox Turbo through the ONNX runtime, a precision per component, each measured against a character's own voice before it was chosen ([reference selection](/docs/infra/claude-interface/reference-selection) is the measurement's page): the speech encoder in half precision, which cost no likeness; the language model the 4-bit variant, which cost none either and speaks twice as fast; the vocoder in full precision, because its half-precision variant is the one that moved the likeness, by a tenth to a fifth on the three characters it was re-measured on once the engine was judged by its sound — and it is the one variant this machine's GPU vocodes into speech rather than silence, so the trade it offers is the top rung's speed for that likeness, declined.

A unit is spoken whole: generation ends at the model's end-of-sequence token, under a ceiling in proportion to the unit's text with a floor for the shortest — a few tokens a character, above what English reads at. Two other shapes stand rejected. A fixed ceiling cuts a long sentence mid-word. No ceiling at all, with the checkpoint's repetition penalty as the only thing against a loop, lets a unit the model finds no end for — a sentence in another script with one Latin word in it, or a reference too short to anchor an ending on — run for minutes, hold every reply behind it, and hand the vocoder a sequence many times longer than any sentence, which it rejects.

Where each component runs is a **device ladder**, fastest rung first, and the rung is chosen by the sound rather than by the load: a provider can load a graph and run it wrong without a word — this machine's WebGPU provider returns a constant near-silence from the full-precision vocoder on most runs and throws nothing, which the hook's silence hid for as long as nothing listened to the output. Every synthesis is checked for a loudest frame loud enough to hear and a quietest frame the speech floor below it — a sentence has pauses, noise has none — and one that fails moves the engine one rung down, releases the one it left, and runs again; a load that rejects moves it the same way; the last rung failing is an error the log sees. The speech encoder runs on the CPU on every rung, since it runs once per character and the WebGPU provider rejects its graph.

| Rung                    | Language model | Vocoder |
| :---------------------- | :------------- | :------ |
| `webgpu`                | GPU            | GPU     |
| `webgpu-language-model` | GPU            | CPU     |
| `cpu`                   | CPU            | CPU     |

The rung the engine speaks on is the status line's second word and the `voice` verb's report, and every move down is a line in `voice.log`. It is also **kept**: the rung a synthesizer has spoken on is written to the state directory, and the next synthesizer starts there rather than walking the rungs above it again — on this machine that was a ten-second load and one silent synthesis at every warm, for an answer the machine had already given. A demotion rewrites the file, so it only ever moves down on its own; the one place a rung this machine once demoted is tried again is the `voice` verb, which clears the file and stops any running synthesizer before its proof, so a driver that has since started vocoding is found by setting the voice up again and by nothing that runs on a reply's path. On this machine — a laptop whose GPU is the processor's own — the engine loads from disk in seconds, encodes a reference in under a second, and on the middle rung reads a few times slower than real time: the language model on the GPU makes speech tokens at about half the rate they are spoken at, and the vocoder on the CPU costs in proportion to the reference's tokens and the unit's together, so for a short sentence the reference is the larger part of it — which is why the reference is trimmed to a few seconds and the units after the first hold a few sentences. A process's first call costs roughly twice that, which the warm request pays. The numbers themselves live in the committed bench beside the reference selection, `scripts/src/voiceMatch/synthesizer.bench.md`, which is where a session reads them rather than timing a sentence again; it measures the host, so it is switched off once committed and flipped on when the engine, its variants or the ladder change. Two other shapes were measured and rejected: the language model on the bottom rung, slower again by a factor, so the ladder's order stands; and two units synthesized at once, hoping the GPU's language model and the CPU's vocoder would overlap, which took longer than one after the other because the vocoder's threads take every core.

## Setting it up

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/genshin.ts" voice ja   # set up, or switch the dub
node "${CLAUDE_PLUGIN_ROOT}/scripts/genshin.ts" voice      # report what is installed
```

The plugin ships code and cards. The engine's runtime is a few hundred megabytes of native binaries and the weights a gigabyte and a half, and the plugin install runs a frozen `npm ci` under a one-minute ceiling — so none of it is a dependency of the plugin, and all of it is installed by the verb into the directory the plugin already owns for its state, the way a project's dependencies are installed beside it rather than shipped with it. Run with a dub, it first stops any synthesizer running and clears the rung on file — the proof below walks the device ladder from the top, and a running engine holds the runtime it may be about to replace — then does four things in order, each skipped when already done:

1. **The runtime.** The plugin carries a second, tiny manifest — `runtime/package.json` with its own npm lockfile — naming the one package the engine needs. The verb copies both into the state directory and runs `npm ci` there with lifecycle scripts off, since the ONNX runtime's binaries ship in the package and its only script fetches a CUDA build on Linux. Renovate moves the manifest's version like every other, and a bumped lockfile is picked up by the next `voice` run. The synthesizer resolves the package from that manifest and loads it by path; the plugin's own manifest never names it.
2. **The weights.** The runtime's own loader fetches what it is asked to load into a cache directory the verb points at the state directory, so downloading the weights is loading the engine once — in the verb's own process, which can print progress, where the detached synthesizer cannot. Exactly the variants the plugin declares are fetched and no other, and the device that loaded is reported.
3. **The proof.** The verb warms the synthesizer with the current session's character and has it speak one sentence, so the person hears the voice they set up before the first reply does — and the sentence comes through the resident process, the same path every reply takes.
4. **The dub.** One file holding the code — `en`, `ja`, `zh` or `ko`, the four the wiki hosts. Every request carries it, so a running synthesizer honours a switch without a restart. The choice is one for the whole roster. It is written **last**, because the file is the gate in front of every spoken reply: a run whose synthesizer never answered the warm leaves no file behind, so the replies stay silent rather than reaching a voice that cannot speak — and a session with no character to prove against writes it on its own way out, having nothing left to fail at.

```text
~/.claude/genshin-persona/
  picks.tsv · pin · muted · volume     ← as before
  language                             ← the dub's code, and the gate
  device                               ← the rung the synthesizer last spoke on, where the next one starts
  runtime/                             ← the engine's package, npm-installed here
  models/                              ← the weights, the runtime's own cache layout
  references/<dub>/<stem>.ogg          ← one clip per line fetched so far
  voice.log                            ← why the synthesizer last refused, if it did
```

```mermaid
flowchart TD
    Verb["voice ja"]
    Clear["stop a running synthesizer,<br/>clear the rung on file"]
    Runtime{"runtime/ installed<br/>from this lockfile?"}
    Install["copy the manifest and lockfile, npm ci"]
    Load["load the engine once → weights cached,<br/>device reported"]
    Proof["warm this session's character,<br/>speak one sentence through the synthesizer"]
    Spoke{"synthesizer<br/>answered?"}
    Language["write language"]
    Off["voice stays off"]

    Verb --> Clear --> Runtime
    Runtime -- no --> Install --> Load
    Runtime -- yes --> Load
    Load --> Proof --> Spoke
    Spoke -- yes --> Language
    Spoke -- no --> Off
```

`teardown` removes the runtime, the weights, the references, the dub, the rung and the log — stopping a running synthesizer first, since the weights it holds open cannot be deleted under it — and leaves the pick records and the pin, which are the persona's rather than the voice's.

## Failure semantics

A reply that cannot be spoken is not spoken, and nothing waits: that rule is unchanged from the service it replaces, with a diagnosis on disk where there was none.

- **The server cannot load** — no runtime, a corrupt weight, a provider that rejects the graph: it writes the reason to `voice.log` and exits. Every hook then finds no server, spawns one, watches it die, and stays silent.
- **A synthesis throws** mid-request: the request is dropped, the reason logged, and the server keeps serving. A sentence the model rejects does not cost a reload for the next.
- **A synthesis is not speech** — a provider ran the graph wrong: the engine moves one rung down the device ladder, the move is logged, the rung on file follows once the engine has spoken there, and the sentence is synthesized again. Only the bottom rung failing drops the request, and its reason is logged like any other.
- **The player does not play** — not installed, refusing the file, exiting part way, or stopped by a signal: the reason is logged, and the request still answers `ok`, since the unit was synthesized. One player process serves a reading, spawned before its first synthesis, because a PowerShell start costs seconds and a player spawned per sentence pays it in silence before every one; a player that dies answers every clip left with why. A stock player that is silent leaves that one line where a hook's silence gives none.
- **A hook connects while the server is still starting**: the handler is attached before anything after the bind yields to the event loop, so the connection is answered once the engine has loaded. A load awaited in that gap leaves the hook that spawned the server — retrying on a short interval, and landing in it — accepted by nobody and waiting indefinitely, its reply never spoken.
- **The wiki has no file under the reference's name**: the request fails, the reason is logged, and the [reference selection](/docs/infra/claude-interface/reference-selection)'s `--check` is what says so for the whole roster at once.
- **A stale socket file** — a server killed without cleanup — is removed before binding when nothing answers on it. A named pipe leaves no file behind.

## What it does not do

- **Read another language.** The engine is English-only, so the dub picks whose voice reads a reply and not what language it reads: `ja` clones the Japanese actor, and the actor reads English. A sentence with no Latin letter in it, or with a letter of any other script in it, is not sent: the first the tokenizer returns as the near-silence the device ladder takes for a broken provider, and the second — a code identifier inside a Japanese reply — it reads from unknown tokens the model finds no end for, up to the ceiling. Gated per sentence, since the synthesis is, so one such sentence inside an English reply is skipped rather than walking the ladder down. Reading a reply in the language it is written in is the [multilingual spoken replies](/docs/proposals/infra/multilingual-spoken-replies) proposal.
- **Stream inside a unit.** A unit is synthesized whole and vocoded once over it, so its first sample arrives after its last token. The [streaming fork of the engine](https://github.com/davidbrowne17/chatterbox-streaming) vocodes a few dozen speech tokens at a time as they are generated, with the reference run through the vocoder again each time, and reaches well under a second to first sound on a desktop GPU that runs the whole engine faster than real time. Here the vocoder runs on the CPU and the reference's tokens are the larger part of each pass, so every extra pass would cost seconds on a machine where the language model is already the slower half; the streaming stays between units.
- **Serve the app.** It is a personal machine's process for a personal plugin; nothing in the estate knows it exists.
- **Ship any audio.** The reference clips are fetched from the wiki to this machine and cached under the state directory, never committed, for the reason the [per-character voices](/docs/infra/claude-interface/per-character-voices) page gives.

## Key files

| File                                                              | Role                                                                                                    |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `packages/genshin-persona/scripts/speak.ts`                       | The Stop hook: the gates, the reply's prose, one request                                                |
| `packages/genshin-persona/scripts/warm.ts`                        | The warm request the SessionStart hook spawns detached                                                  |
| `packages/genshin-persona/scripts/voice.ts`                       | The resident synthesizer: the socket, the load, the queue, the idle exit                                |
| `packages/genshin-persona/src/services/sendVoiceRequest.ts`       | The client: connect, else spawn a server and retry inside the load budget                               |
| `packages/genshin-persona/src/services/createLatestWinsQueue.ts`  | One pending request, replaced by whatever arrives after it, and the running one told                    |
| `packages/genshin-persona/src/services/createVoiceSynthesizer.ts` | The engine on the first rung that loads, moved down by a synthesis that is not speech                   |
| `packages/genshin-persona/src/services/checkIsSpeech.ts`          | What a synthesis has to sound like to count as spoken                                                   |
| `packages/genshin-persona/src/services/readVoiceDevice.ts`        | The rung the last synthesizer spoke on, where the next starts                                           |
| `packages/genshin-persona/src/services/readReferenceClip.ts`      | The character's clip, fetched from the wiki on first use and cached                                     |
| `packages/genshin-persona/src/services/installVoiceRuntime.ts`    | The runtime manifest and lockfile copied and `npm ci` run with scripts off                              |
| `packages/genshin-persona/runtime/package.json`                   | The one package the engine needs, moved by Renovate like any other                                      |
| `packages/genshin-persona/src/services/getSpokenProse.ts`         | What of a reply is spoken                                                                               |
| `packages/genshin-persona/src/services/splitSentences.ts`         | The sentences a reply is cut into, the ones the engine cannot read left out                             |
| `packages/genshin-persona/src/services/getSpeechUnits.ts`         | The units it is read in: the first sentence alone, then a few sentences each                            |
| `packages/genshin-persona/src/services/checkIsSilent.ts`          | Muted, or a volume of zero — no reply sent and no engine woken                                          |
| `packages/genshin-persona/src/services/createAudioPlayer.ts`      | The desktop's stock player, one process per reading, fed a temp WAV path per clip and answering each    |
| `packages/genshin-persona/src/services/constants.ts`              | The state directory's voice half, the engine's variants, the device ladder, the budgets and timeouts    |
| `scripts/src/voiceMatch/synthesizer.bench.ts`                     | The synthesizer timed per sentence shape on this host, through the runner's runtime; off once committed |

## Notes

- The hook speaks a reply's prose, not the reply: a reply is often a table or a diff, and the point is to hear what the turn said, not to hear code read aloud. A reply with no prose at all is not spoken. It was a first sentence until the reading was streamed — the cut was the wait, and once the wait was one sentence rather than the whole reply there was nothing left for it to buy.
- The idle timeout and the load budget are the two constants a person might tune; the plugin declares both and nothing else about the server is configurable, because the `voice` verb is where the choices are made.
- The AMD card on this machine rules the Python engines out as much as the install ceiling does: none of the CUDA toolchains reach it under Windows, and the WebGPU provider is the one route that does from Node. DirectML was tried and rejects the speech encoder's attention op and a slice in the language model.
