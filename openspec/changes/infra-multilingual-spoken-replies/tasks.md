## 1. Gate

- [ ] 1.1 Upgrade to a released runtime that loads the multilingual checkpoint from a repository shipping complete configs. Verify: the `voice` verb speaks one sentence on the multilingual model.
- [ ] 1.2 Decide whether the runtime's processor applies the Cangjie character mapping or the request has to. The release answers the question, and the options are the runtime applying it or the request applying it. Decides nothing until the release ships.

## 2. Model

- [ ] 2.1 Point the voice's model id at the multilingual export and remove the English engine's id. Verify: a test named after the scenario 'The dub still names the voice and the text names the language' written first and seen failing.
- [ ] 2.2 Re-measure each precision choice on one character and regenerate the likeness column. Verify: `pnpm ai:voice-match` runs per dub, and `--write` regenerates the likeness column.
- [ ] 2.3 Add the guidance scale and sampling constants beside the speech token limit, at the values the model card's reference loop uses. Verify: a test named after the scenario 'A Japanese line is spoken as Japanese' written first and seen failing.

## 3. Input

- [ ] 3.1 Read each sentence's language from its script, with Latin letters first. Verify: tests named after the scenarios 'English prose with one Japanese phrase reads as English' and 'A Korean line is spoken as Korean' written first and seen failing.
- [ ] 3.2 Split lines at the sentence endings of every script. Verify: a test named after the scenario 'A full-width sentence ending splits a Japanese line' written first and seen failing.
- [ ] 3.3 Drop a sentence in a script no model reads, log it once and keep speaking. Verify: a test named after the scenario 'An unreadable sentence is dropped and logged' written first and seen failing.

## 4. Output

- [ ] 4.1 Cut each sentence at its clause punctuation and start playback at the first clause. Verify: a test named after the scenario 'Playback starts at the first clause of a long sentence' written first and seen failing.
- [ ] 4.2 Hear one Chinese sentence through the Chinese token before the Chinese path is declared working. Verify: the `voice` verb speaks a Chinese sentence, and the person hears it.
