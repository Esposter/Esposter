# Throwing

Read when a code path throws, or a mock stubs a vendor interface it only partly serves. The one-line rule is in `SKILL.md`; this page is its full statement and its sanctioned exceptions.

- **Never `new Error(...)`** (`error-handling/no-bare-error` lints it, off in every `*.test.ts` and `*.bench.ts`, and elsewhere only by a disable whose reason names why the site cannot use the constructor — a package that builds before `@esposter/shared`, or the boundary that turns an unknown throw into the plain `Error` everything else wraps) — throw `new InvalidOperationError(operation, name, message)` from `@esposter/shared`, picking the appropriate `Operation` value (`Operation.Read`/`Create`/`Update`/`Delete`, …). Use the resource name (`file.name`, entity ID) as `name`; fall back to the calling function's name (`deserializeJson.name`) if none better.

- **Exception: a test double's unserved member.** A double implementing a wide vendor interface it only partly needs throws, from each member it does not serve, an error of its own class naming that member, in place of `InvalidOperationError`. That error's `Operation` describes what the caller asked for, and here the caller asked for something valid — it is the double that falls short — and nothing catches it: reaching one means a test called a method the double never meant to serve.
