# Throwing

Read when a code path throws, or a mock stubs a vendor interface it only partly serves. The one-line rule is in `SKILL.md`; this page is its full statement and its sanctioned exceptions.

- **Never `new Error(...)`** (`error-handling/no-bare-error` lints it, off in every `*.test.ts` and `*.bench.ts`, and elsewhere only by a disable on the site where the mechanism cannot use itself — `generateExports`, in a package that builds before `@esposter/shared`, `toAppError` and `requireAuthData`) — throw `new InvalidOperationError(operation, name, message)` from `@esposter/shared`, picking the appropriate `Operation` value (`Operation.Read`/`Create`/`Update`/`Delete`, …). Use the resource name (`file.name`, entity ID) as `name`; fall back to the calling function's name (`deserializeJson.name`) if none better.

- **Exception: a mock's unreproduced member.** A mock implementing a wide vendor interface it only partly needs throws `azure-mock`'s `NotImplementedError(this.member.name)` from each member it does not serve. `InvalidOperationError`'s `Operation` describes what the caller asked for, and here the caller asked for something valid — it is the mock that falls short — and nothing catches it: reaching one means a test called a method the mock never meant to serve.
