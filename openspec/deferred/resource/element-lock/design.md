# Element lock

Locking an element so that no move, resize or delete changes it until it is unlocked.

## Why deferred

A lock is a flag that every edit must check. The move and resize commands, the arrow-key nudge, the delete, the duplicate, the paste and the typed move from an agent would each refuse a locked element, so the rule would spread over the whole edit surface ([whiteboard](../../../specs/resource/whiteboard/design.md)). The toolbar's lock keeps a tool in hand and is not an element lock. The cost is not earned until a placed element is lost to a stray drag.

**Revisit when:** a reader reports a placed element moved or deleted by accident.
