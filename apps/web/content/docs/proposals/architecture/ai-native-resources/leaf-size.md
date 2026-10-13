---
title: Leaf size
description: Proposal — a string or other non-object leaf past the agent read cap is answered its size, as an object or an array is, so the agent can tell how far to narrow the read.
model: claude-haiku-5-5
---

# Leaf size

Built on the [agent content tools](/docs/architecture/agent-content-tools), whose read past `MAX_AGENT_READ_SIZE` leaves the content out and answers each member's size. That answer only covers a container. A string or other non-object value at the pointer past the cap is answered `memberSizes: {}`, which reads the same as an empty object: the agent gets neither the content, nor its length, nor its size, so it cannot tell how far to narrow the read.

## Scope

**Today:** a value at the pointer that is a plain object or an array past the cap is answered its members' sizes (an object by key, a page by index). Any other value past the cap is answered `memberSizes: {}`.

**This adds:**

1. **A size for a leaf** — the result of a read past the cap at a non-container pointer carries the value's JSON size, so the reply names what it withheld rather than an empty set of members.
2. **The contract** — the agent-facing field is `size`, the singular of the existing `memberSizes`, on a leaf's `ReadResourceContentResult` and in the tool's description, since an agent reads both. A string's length counts toward its size, because the size is what an agent pays to read the value.

Once the field exists, the test file gains a case for the leaf's answer, beside the object and array cases; no test pins the empty answer today.

## Key files

| File                                                             | Change                                                          |
| :--------------------------------------------------------------- | :-------------------------------------------------------------- |
| `apps/web/server/services/resource/readContentAtPointer.ts`      | answers a leaf past the cap its size, not `memberSizes: {}`     |
| `apps/web/server/services/resource/readContentAtPointer.test.ts` | adds a case for the leaf's answer                               |
| `apps/web/shared/models/resource/ReadResourceContentResult.ts`   | the result's shape gains the leaf's size                        |
| `apps/web/content/docs/architecture/agent-content-tools.md`      | the "Past `MAX_AGENT_READ_SIZE`" bullet names the leaf's answer |

## Notes

- The field's shape is settled as above: `size` beside the existing `memberSizes`, a string's length included.
- A reply that truncates the string instead is rejected: it is the document the read refuses to hand over whole.
