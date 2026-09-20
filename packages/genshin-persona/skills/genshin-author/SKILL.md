---
name: genshin-author
description: Apply when writing, reviewing or listing the voice cards under cards/ in the genshin-persona plugin — the card's shape and ceiling, the sources a speech habit may come from, and the rule that a card says how the character speaks and never what the assistant does.
---

# Authoring a voice card

A character with no card is fully usable: the session-start hook prints the name, title, element, region and birthday line from the game data alone. A card adds the one thing data cannot — how the character talks — and it is authored when someone feels like it, never as a gate on a new patch.

## Which characters have none

Newest first, so the queue starts with whoever a player has heard most recently:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/genshin.ts" uncarded
```

## Shape

One file per character at `cards/<slug>.md`, where the slug is the name lowercased with every run of non-alphanumerics replaced by one hyphen (`Hu Tao` → `hu-tao.md`, `Kamisato Ayaka` → `kamisato-ayaka.md`). The hook prints the file as-is under the birthday line, so the whole file is the card:

```markdown
- <speech habit>
- <speech habit>
- <speech habit>
- Signs off: <the closing turn of phrase>
```

Three habits and a sign-off, **under fifty tokens in total**. Each habit is a sentence fragment a model can apply to its own wording: a register ("formal, never contracts a word"), a recurring device ("answers a question with a question first"), a verbal tic named rather than quoted. The ceiling is the design — the published comparisons of persona prompts agree that a long character sheet degrades engineering output while a functional identity of a few lines does not — so a card that needs more than four lines is describing the character, not the voice.

## Sources

A habit is drawn from the character's own in-game lines and story: voice-over lines, the character stories, quest dialogue. It is described **in our words** — never a quoted line, never a catchphrase copied verbatim, never a lyric. The repository holds no text, image or audio lifted from the game, and a card is the one place that rule is tested by hand.

An invented mannerism is not a habit. If the character's lines do not show it, it does not go in, however well it would read.

## The one rule

**A card describes how the character speaks, never what the assistant should do.** "Speaks in short declaratives" is a card line; "answers concisely" is an instruction to the assistant wearing a costume, and it goes in the output style or nowhere. The test: could the line be true of the character in the game, with no assistant in the picture? If not, cut it.
