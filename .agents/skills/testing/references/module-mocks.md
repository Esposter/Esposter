# What to Mock

Read when reaching for `vi.mock`, a spy or any other double — whether the behaviour needs one at all, and which seam it replaces.

## What to mock

Mock the **smallest seam that makes the behaviour under test reachable**, and never re-declare a mock another file already owns.

- **Prefer driving state over mocking a getter** — a store's derived state usually has a real input to set (set the route param the store derives its state from). `vi.spyOn(store, "prop", "get")` breaks `storeToRefs`, which reads the underlying ref rather than the spied accessor.
- **Mock a module only for what the environment genuinely cannot do** — a canvas downscale, a network PUT, a clock. If a fake is only saving setup lines, build the real input instead.
- **A live update is faked at the socket seam.** A typed event reaches a store only through the socket `openRealtimeSocket` opens, so a test fakes that module with its colocated double (`apps/web/app/services/realtime/openRealtimeSocket.test.ts`) and hands a frame to the `onFrame` the code under test passed it, rather than faking the connection store or the event handler.

## Handler arguments the test does not read

A context a handler takes only to pass along — a Workers execution context, say — is a plain no-op with the real type. A bare `vi.fn()` would typecheck there, since it is `any`-shaped and so never checked against the contract, but nothing asserts on it, so the spy buys nothing. Reach for `vi.fn<...>()` typed against the real signature only when a test asserts the arguments it receives.
