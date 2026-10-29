## REMOVED Requirements

### Requirement: Packs are served only under the development server

**Reason**: the development server reads the same published packs as a build, so it serves none.

### Requirement: A character's pack is answered only from its own folder

**Reason**: no route answers a pack.

### Requirement: Each request reads the pack from disk afresh

**Reason**: no route reads a pack from disk.
