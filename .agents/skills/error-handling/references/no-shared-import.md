# Code Without `@esposter/shared`

Read when handling a rejection in code that cannot import `@esposter/shared` — a package a stranger's `npm ci` installs alone, or a configuration file loaded before any workspace package is built.

- **A package installed alone** — the shipped `genshin-persona` plugin, installed by a stranger's `npm ci` — reads a rejection as `const [outcome] = await Promise.allSettled([promise])` and terminates at the process boundary: a hook's `registerQuietExit`, the synthesizer's log-and-exit, a verb's stderr and exit code. The skill's rules still hold there — the boundary handler writes what was lost (stderr, or the plugin's own log) before it exits, and a fallback taken on a rejection says why first.
- **A file loaded before the packages build** — the Nuxt configuration `nuxt prepare` reads from `postinstall` — wraps with neverthrow directly under a disable of the `fromThrowable`/`fromPromise` ban, and inlines its ok handler for want of `noop`. The helpers themselves are the only other code that calls the primitives.
