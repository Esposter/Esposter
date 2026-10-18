# Dangling Reference Cleanup

When a resource is deleted, every resource whose content references it — a Dashboard visual bound to a Sheet, an Email merging from a survey's responses, a Program whose audience is a Sheet — would have that reference blanked or flagged as broken in its own content, so nothing is left pointing at a resource that is gone. The [resource-link index](../../../specs/architecture/resource-links/design.md) makes finding those consumers one read.

## Why not

- **A delete is soft, so the reference is not broken yet.** A deleted resource sits in the [recycle bin](../../../specs/resource/recycle-bin/design.md) for its retention window, and a restore hands it back whole. A reference blanked at delete time is one the restore cannot bring back, so cleanup would need an undo on every restore: a second write across other owners' content, in the opposite direction, for each delete and each restore.
- **Resolving at read time already gives the right answer both ways.** A consumer re-resolves its reference whenever it reads it, so while the source is binned or purged the consumer shows it as missing, with the fix next to it ([datasets](../../../specs/architecture/dataset/design.md)), and after a restore the same unchanged reference reads again. The content never claims anything that a read does not check.
- **Each rewrite is a contended save.** Each consumer's blob is written under its own `contentVersion`, against whoever is editing it at that moment. A delete that fans out into saves across other resources can partly fail, and every partial state it leaves behind is worse than the untouched reference.
- **Published snapshots are unaffected anyway.** A published Dashboard bakes its data in at publish time, so the readers cleanup would protect are the owner's own, who are better served by the missing-source state where they pick the reference.
