# Tasks

## 1.

- [ ] 1.1 Declare topics on every tRPC query and mutation through `meta`, and fail a test for any procedure without a declaration. Verified by that test.
- [ ] 1.2 Build `TopicObject`: subscribers in storage, coalesced publish to each subscriber's user object. Verified by its Miniflare tests.
- [ ] 1.3 Teach `UserObject` the `watch` and `unwatch` frames, each socket's topics in its attachment, and subscribing and unsubscribing on the first and last watching tab. Verified by its Miniflare tests.
- [ ] 1.4 Publish a mutation's topics from the tRPC middleware after it resolves, never for a failed one. Verified by the middleware test.
- [ ] 1.5 Make the client query cache watch the topics of mounted queries and refetch them on invalidation. Verified by the store test.
