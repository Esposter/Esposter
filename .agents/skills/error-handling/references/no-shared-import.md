# A Package Without `@esposter/shared`

Read when handling a rejection in a package a stranger's `npm ci` installs alone — the `genshin-persona` plugin — which cannot import `@esposter/shared`.

- **A package that cannot import `@esposter/shared`** — the shipped `genshin-persona` plugin, installed alone by a stranger's `npm ci` — reads a rejection as `const [outcome] = await Promise.allSettled([promise])` and terminates at the process boundary: a hook's `registerQuietExit`, the synthesizer's log-and-exit, a verb's stderr and exit code. The skill's rules still hold there — the boundary handler writes what was lost (stderr, or the plugin's own log) before it exits, and a fallback taken on a rejection says why first.
