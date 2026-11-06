# Shape-first typed documents

A document schema built at runtime from the registry, one discriminated union per set of accepted types, so the same schema would both validate a document and describe it to an agent.

**Why not:** The typed slot ports replaced it. The runtime union had to be returned as each consumer's node type by assertion, and its per-registry cache read back by one more, so the schema path carried the two assertions that the core's typed path exists to remove. A consumer's static node schemas, each satisfying its own interface, with a children port typed over them, give the same validation and the same agent-readable JSON Schema with no assertion and no cache. The refusal rules the design settled (a refusal at the node's type field, a message naming the slot's accepted types, a strict props object, an id and count refinement over the whole tree, a paste checked as the destination slot's children) carried over unchanged, and the as-built record holds them.

**What is still wanted, and where it lives now:** the agent's view of a slot, which lists the types the root's content takes, is checked by the agent content tools' schema test, and the stored-document parse across every webpage type is checked by the webpage node schema test. Email merge fields are not specced: the email editor owns merge tags, and that work is its own change when it is designed.
