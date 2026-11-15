# Multilingual Spoken Replies

**What it was.** A reply's spoken language read from its text, and a multilingual engine speaking it in the dub's voice, so that a Japanese, Korean or Chinese line is spoken rather than dropped, with each sentence spoken clause by clause so playback starts early. Today the dub picks whose voice reads a reply and nothing else: `ja` clones the Japanese actor, and a line the English-only engine cannot read is not sent at all.

**Why deferred.** Transformers.js loads the English Chatterbox exports and no multilingual one. The multilingual checkpoint fails at load, because no public export ships a `config.json` (Transformers.js issue 1656). Loaded anyway, it speaks only short unintelligible vocalizations, because it needs classifier-free guidance the JavaScript generation loop does not implement (pull request 1705, still open). The work does not start on that pull request's branch, nor by writing the generation loop by hand: that loop is the upstream work, and a copy would be a second engine to maintain.

**Revisit when:** a released version of the runtime loads the multilingual checkpoint from a repository shipping complete configs, and the `voice` verb speaks one sentence through it.

**Cheaper interim:** a reply in a script no model reads is not spoken, and the dub names whose voice reads the English text ([spoken replies](../../../specs/infra/claude-interface/spoken-replies/design.md)).

## Sources

- [Chatterbox](https://huggingface.co/ResembleAI/chatterbox) — the model family, the multilingual checkpoint among it.
- [Transformers.js issue 1656](https://github.com/huggingface/transformers.js/issues/1656) — why the multilingual checkpoint does not load: no public export ships a `config.json`.
- [Transformers.js pull request 1705](https://github.com/huggingface/transformers.js/pull/1705) — why a loaded checkpoint speaks unintelligibly (no classifier-free guidance), and the guidance path and sampling that would close the gate once released.
