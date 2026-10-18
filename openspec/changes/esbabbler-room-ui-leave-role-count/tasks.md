## 1. Leave count

- [ ] 1.1 Decide how a leaver's top role is known when their roles were never loaded: read it from the server on leave, or carry it on the subscription's leave event. Verify: the decision is written into the room-ui design, with the rejected option and its reason.
- [ ] 1.2 Decrement the leaver's role group with the total on every leave. Verify: a test named after the scenario 'a leave from an unloaded page keeps every group count equal to its members', seen failing first.
