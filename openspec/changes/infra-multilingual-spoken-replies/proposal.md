# Multilingual spoken replies

## Why

The voice picks whose voice reads a reply and nothing else. A Japanese actor's voice reads English, because the engine is English-only, and a reply written in Japanese reaches the engine with no Japanese it can read and comes back as near-silence. Today such a line is not sent at all. The language has to become a property of the text, not a limit of the engine, so that a Japanese or Korean line is spoken in the language it is written in.

## What Changes

A reply's spoken language is read from its text, and a multilingual engine speaks it in the dub's voice.

- The engine becomes a multilingual one covering English, Japanese, Chinese and Korean, once a released runtime loads it. This is the gate for the change.
- Each spoken sentence's language is read from its script, and a sentence with Latin letters in it is English.
- A sentence in a script no model reads is not spoken, and the reason is logged.
- A spoken line is split into sentences at the sentence endings of every script the roster speaks.
- A sentence is spoken clause by clause, so playback starts before the whole sentence is synthesized.
- The dub still names the voice: `voice ja` still chooses the Japanese actor's voice, and English text is read in it.
- Chinese is not declared working until a Chinese sentence has been heard.

## Capabilities

- **infra/multilingual-spoken-replies** (new)

## Waiting on

- A released version of the runtime's one dependency that loads the multilingual checkpoint from a repository shipping complete configs. The upstream state is Transformers.js issue 1656 and pull request 1705; the work does not start on the pull request's branch.

## Impact

- The voice's engine, its precision choices and its voice likeness are re-measured against the new engine.
- Replies in Japanese, Korean and Chinese are spoken instead of dropped.
- Spoken playback starts earlier in long sentences.
