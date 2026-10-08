---
title: Characters
description: The official MMD model packs each character is served from, read from the app's public Blob container, with the terms bundled beside the model shown wherever the character is chosen. Nothing of a model is committed or drawn yet.
---

# Characters

A character's official MMD model pack is hosted in the app's Blob Storage rather than the repository, and the terms text bundled with it is read and shown beside it. The reader fetches the terms of one character by its id from a base URL the app passes in, so the world holds no account of where storage lives.

```mermaid
flowchart LR
  BLOB["App-assets container: genshin/characters/{id}/terms.txt"] -->|fetched by the character's id| READ["readCharacterTerms"]
  READ -->|text| TERMS["CharacterTerms: the terms, verbatim"]
  READ -->|failure| TERMS
```

The pack's model file is uploaded beside its terms and not read yet: parsing a PMX needs a dependency that is not in the workspace (see the proposal).

## Key files

| File                                                                  | Role                                                                    |
| :-------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| `packages/genshin-world/src/services/character/readCharacterTerms.ts` | Fetches a character's `terms.txt` from its pack's base URL, as a Result |
| `packages/genshin-world/src/services/character/constants.ts`          | The timeout a terms fetch is abandoned past                             |
| `packages/genshin-world/src/components/Character/Terms/Index.vue`     | Shows the terms verbatim, or that they could not be loaded              |
