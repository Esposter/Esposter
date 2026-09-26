# What to Mock

Read when reaching for `vi.mock`, a spy or any other double — whether the behaviour needs one at all, and which seam it replaces.

## What to mock

Mock the **smallest seam that makes the behaviour under test reachable**, and never re-declare a mock another file already owns.

- **Prefer driving state over mocking a getter** — a store's derived state usually has a real input to set (set the route param the store derives its state from). `vi.spyOn(store, "prop", "get")` breaks `storeToRefs`, which reads the underlying ref rather than the spied accessor.
- **Mock a module only for what the environment genuinely cannot do** — a canvas downscale, a network PUT, a clock. If a fake is only saving setup lines, build the real input instead.

## `InvocationContext` logHandler

Always a plain no-op: `new InvocationContext({ logHandler: () => {} })`. A bare `vi.fn()` does typecheck here — it is `any`-shaped, so it satisfies the `LogHandler` contract without ever being checked against it — but nothing asserts on the logs, so the spy buys nothing. Reach for `vi.fn<LogHandler>()` only when a test actually asserts what was logged.
