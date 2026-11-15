# Edit History

Append-only store of previous versions of an edited message, post or comment, with a "view edits" link on each edited one. The refusals below hold for all three.

**Why not**

- Storage grows unboundedly with every edit across all users.
- Marginal value on a casual platform. Almost nobody audits edits, and a casual platform where a person fixes their own typos does not need an audit trail. Moderation-grade accountability lives in the moderation log ([moderation design](../../../specs/esbabbler/moderation/design.md)), where it matters.
- The shipped `(edited)` label already signals that a message changed.
- The posts table deliberately stays one row per post, so a post's revisions would need a store of their own.
