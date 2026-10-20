# Roadmap

## Later

- [ ] Refuse a nested child whose type a slot's declaration does not accept, in the library's document and node-list parses. Today `createBlockDocumentSchema` and `createBlockNodesSchema` check only the root's content types and the slot the caller names, and `checkBlockNodeIds` walks each slot's children for ids alone, so a consumer's permissive node schema lets a list of a type the slot's declaration refuses parse clean, while `getAcceptedTypes` reports that slot as accepting only its declared types. The decision is whether the library's parse threads the registry into the id walk so the two statements agree, or whether the consumer's node schema keeps the check. The removed test "a document from another registry" is the case the decision must cover again, and [the slot-keyed children port](../headless-block-editor-slot-keyed-children/proposal.md) is the change whose walks this one touches.
