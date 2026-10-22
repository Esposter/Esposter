## 1. Leave count

- [x] 1.1 Decide how a leaver's top role is known when their roles were never loaded: read it from the server on leave, or carry it on the subscription's leave event. Verify: the decision is written into the room-ui design, with the rejected option and its reason.
- [x] 1.2 Re-read the room's group counts from the server on a leave whose roles were never loaded. Verify: a test named after the scenario 'a leave from an unloaded page keeps every group count equal to its members', seen failing first.
