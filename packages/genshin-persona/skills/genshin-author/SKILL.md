---
name: genshin-author
description: Apply when writing, reviewing or listing the voice cards under cards/ in the genshin-persona plugin — the card's shape and ceiling, the sources a speech habit may come from, and the rule that a card says how the character speaks and never what the assistant does.
---

# Authoring a voice card

A character with no card is fully usable: the session-start hook prints the name, title, element, region and the bracketed birthday note from the game data alone. A card adds the one thing data cannot — how the character talks — and it is authored when someone feels like it, never as a gate on a new patch.

## Which characters have none

Newest first, so the queue starts with whoever a player has heard most recently:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/genshin.ts" uncarded
```

## Shape

One file per character at `cards/<slug>.md`, where the slug is the name lowercased with every run of non-alphanumerics replaced by one hyphen (`Hu Tao` → `hu-tao.md`, `Kamisato Ayaka` → `kamisato-ayaka.md`). The hook prints the file as-is under the birthday note, so the whole file is the card:

```markdown
- <speech habit>
- <speech habit>
- <speech habit>
- Greets: <one line of hello, said by the character to the person>
- Signs off: <the closing turn of phrase>
```

Three habits, a greeting and a sign-off, **about fifty tokens in total**. Each habit is a sentence fragment a model can apply to its own wording: a register ("formal, never contracts a word"), a recurring device ("answers a question with a question first"), a verbal tic named rather than quoted. The ceiling is the design — the published comparisons of persona prompts agree that a long character sheet degrades engineering output while a functional identity of a few lines does not — so a card that needs more lines is describing the character, not the voice.

**The greeting is the one line a card performs rather than describes.** The session-start hook shows it to the person as the welcome, so it is written as the character would say hello — a fresh line in our words that echoes how their own hello line moves (who they name themselves as, what they ask first), never that line reworded closely enough to be recognised.

The welcome puts the greeting straight under the plugin's own lines — the nameplate and the bracketed birthday note — so the two kinds must not blur. The greeting is **speech, in the first person or addressed to the person at the keyboard, in the present**: "At your service" is a greeting, "Greets warmly" is a description, and "Clorinde is here" is a caption. It also holds nothing the character could not know from where they stand: no date, no birthday, no session or plugin. The birthday is the note's to say, and the character answers about it only when asked, so a greeting that mentions one is wrong on a birthday and wrong every other day.

## Sources

A habit is drawn from the character's own in-game lines and story: voice-over lines, the character stories, quest dialogue. The game-data dependency carries the voice lines (`voiceovers`) and each character's description, so a card is written with them open. It is described **in our words** — never a quoted line, never a catchphrase copied verbatim, never a lyric. The repository holds no text, image or audio lifted from the game, and a card is the one place that rule is tested by hand.

An invented mannerism is not a habit. If the character's lines do not show it, it does not go in, however well it would read. A character the data has no lines for yet gets a card drawn from their description and title alone, and it says less; when a patch brings their lines, the card is rewritten from them.

## The one rule

**A card describes how the character speaks, never what the assistant should do.** "Speaks in short declaratives" is a card line; "answers concisely" is an instruction to the assistant wearing a costume, and it goes in the output style or nowhere. The test: could the line be true of the character in the game, with no assistant in the picture? If not, cut it.
