# A localized usage

Read when a tool prints in its reader's language, so its usage and its unknown-command errors have to follow that language.

- **A tool that prints in the reader's language passes `runMain` its own `showUsage`**, printing its localized usage and exiting, since citty prints the usage before an English error and exits 1 after it; exiting inside `showUsage` answers every unknown or missing command in the reader's language (`packages/genshin-persona/scripts/genshin.ts`).
