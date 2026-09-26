# Host-Dependent Tests

Read when a suite is skipped on a platform, or its output depends on the host running it — a terminal's colour, a path separator, a locale.

## Output that depends on the host

- **Strip ANSI before snapshotting CLI output** — `checkIsColorEnabled()` reads the ambient terminal/env (TTY, `FORCE_COLOR`, `NO_COLOR`), so a raw snapshot of colorized output flip-flops between an interactive shell, `-u` and CI. Wrap the value in `stripAnsi(...)` (`#src/services/cli/color/stripAnsi.test` in virrun) so the snapshot checks message content alone; colouring is verified in the `colorize`/`checkIsColorEnabled` tests. Narrow a `string | undefined` with `assert.exists(value)` first.
- **Non-deterministic / OS-specific error messages are not snapshotted at all** — when a thrown message embeds something unreconstructable portably (an absolute path differing by OS, e.g. a Node `ENOENT`), a `toThrowErrorMatchingInlineSnapshot` passes locally and fails in CI. Observe the behaviour portably instead: assert `fs.existsSync(path)` is `false`, or that the returned value changed.

## Capability and platform gating

- **`describe.skipIf`/`test.skipIf` gate on the same capability probe the production code uses** (e.g. `describe.skipIf(!isSupported())`), not a narrower proxy (e.g. `process.platform !== "linux"`); a host can pass the platform check yet still lack the underlying dependency, so the narrower gate lets an unsupported host through.
- **Never construct a throw-on-unsupported resource in describe scope** — `describe.skipIf(...)` still executes its body at **collection time** even when the suite is skipped, so `const x = createThrowingThing()` at describe scope throws on unsupported hosts before the skip applies. Construct it **inside each test/bench callback** instead; only factories that never throw may stay at describe scope and be reused across tests.
- Where the two platforms genuinely assert different values, write two `skipIf` tests rather than an in-test branch — see **Platform-gated tests** below.

## Platform-gated tests

Gate with two `test.skipIf`/`describe.skipIf(process.platform …)` tests, one per platform, each with its own snapshot; never an in-test `if` branch. Only the matching OS's test runs, so neither asserts conditionally and no `vitest/no-conditional-expect` disable is needed. `process.platform` reads directly — no `isWindows` const.

```ts
test.skipIf(process.platform !== "win32")("bundle size (Windows)", () => { ... });
test.skipIf(process.platform === "win32")("bundle size (POSIX)", () => { ... });
```
