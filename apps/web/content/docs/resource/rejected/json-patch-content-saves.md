---
title: JSON Patch content saves
description: Rejected — saving resource content as a generic RFC 6902 JSON Patch against the stored document instead of the whole document.
---

# JSON Patch Content Saves

Every resource's content is JSON, so a save could send an RFC 6902 JSON Patch — a list of add, remove and replace operations, each addressed by a JSON Pointer — computed by diffing the edited document against the last stored one. The server would apply it to the stored document and validate the result.

## Why not

- **The format is generic; the diff is not.** RFC 6902 defines how to express a patch, not how to compute one. Arrays are addressed by index, so a diff that compares elements by position turns one row inserted at the top of a Sheet into a replace of every row below it — a patch as large as the document. A diff that detects insertions needs a longest-common-subsequence pass, whose cost grows with the product of the two lengths: the wrong shape for a document large enough to need a patch at all.
- **Per-type knowledge would fix the diff, and then it is no longer generic.** Array diffs become cheap with stable element identities or with the editor recording its own operations, such as the Sheet's command stack. Each type would then need its own mapping, and every type without one would get no benefit.
- **A dictionary delta gets the same saving with no diff at all.** Compressing the new document with the stored one as the zstd dictionary finds the unchanged bytes wherever they moved to, knows nothing about any type's shape, and is already how the [resource version store](/docs/resource/resource-version-store) stores versions. [Delta content saves](/docs/proposals/resource/large-content-saves/delta-saves) puts that on the wire instead.

## Sources

- [RFC 6902 — JavaScript Object Notation (JSON) Patch](https://www.rfc-editor.org/rfc/rfc6902.html) (IETF) — array elements are addressed by numeric index, and the RFC does not define how a diff is computed.
