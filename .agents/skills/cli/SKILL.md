---
name: cli
description: Apply when writing or changing anything run from a command line with arguments — a package's `bin`, a `scripts` tool behind a pnpm script, a plugin's script verbs — or when reading `process.argv`. Esposter's command lines — every one a citty command, so parsing, `--help`, usage and errors come from one library rather than a hand-rolled parser per tool.
---

# CLI

A command line here is a citty command: citty reads the arguments, renders `--help` and the usage line, rejects a missing required argument, and turns a thrown error into a message and exit code 1. A tool that parses its own arguments rebuilds all of that, differently each time, and none of it is tested.

## Settled — do not re-propose

- **A hand-written usage string, `--help` flag or argument parser**, `node:util`'s `parseArgs` included. Each drifts from the arguments it describes, since nothing reads the string against the code, and `parseArgs` stops at parsing: no subcommands, no usage, no help. citty renders the usage from the same `args` the command parses.
- **An interface restating a command's arguments** beside the command. `defineCommand` infers the parsed arguments from the object written inline in it, so a second declaration only has to be kept in step by hand.
- **A module-scope `const <name>Args = { … } as const` typed `CommandDef<typeof <name>Args>`.** Under `isolatedDeclarations` the constant then needs an explicit type of its own, which is the restated interface again.
- **Exporting a command as `CommandDef`.** `CommandDef` without arguments is `CommandDef<ArgsDef>`, and a command with its own arguments is not assignable to it (its `run` takes narrower arguments); `CommandDef<any>` is `no-explicit-any`. The export is typed `SubCommandsDef[string]`, citty's own type for a subcommand.

## Rules

- **`process.argv` is read by citty alone**; `no-restricted-properties` bans it everywhere else. A disable names the forcing agent that reads argv without citty (a test runner's own subcommand, the host re-launching its own entry).
- **The entry file runs one command and holds nothing else**: `await runMain(<tool>Command)`. A tool with one command defines it inline there, its `run` the work; a tool with several has a root command whose `subCommands` map each name to its own file.
- **One subcommand per file**, `<name>Command.ts`, in the tool's `commands` folder (`services/cli/commands/` in a package, `scripts/src/services/<tool>/commands/` in the scripts package), exported as `export const <name>Command: SubCommandsDef[string] = defineCommand({ … })`, and the root typed `CommandDef`. A command parses and calls: its work is a service beside it, which is what a test reaches.
- **Arguments are written inline in `defineCommand`**, each with a `description`, and the command with a `meta` holding its `name` and `description`: they are the help. A set of arguments several commands share is one exported constant named `…Args`, typed from citty's own argument types (`Record<"x" | "y", PositionalArgDef & { required: true }>`), and spread in.
- **Positional arguments are read in the order they are declared**, so the objects inside a `defineCommand` call and a shared `…Args` constant are exempt from `perfectionist/sort-objects` (`packages/configuration/eslint/plugins/perfectionist.js`), and are written in the order the command line takes them.
- **Arguments are declared by kind**: a `positional` for what the command acts on, a `boolean` for a switch (`--no-<name>` negates one defaulting to true), an `enum` for a closed set, and a `string` for the rest. An enum's `options` is `Object.values(<Enum>)` written in place, which types the parsed value as the enum with its default; a `readonly` list spread in (`[...BackendTypes]`) is inferred as a readonly tuple under `defineCommand`'s `const` parameter, and the parsed value loses its default and reads as possibly `undefined`. A choice that is not what the command acts on is an option (`--motion entry`), never an optional positional before a list, which citty cannot tell apart from the list.
- **citty has no number type**, so a numeric argument is a `string`, its default a string (`default: "8"`), converted with `Number` where `run` hands it on.
- **A list of any length is the positionals after the declared ones**, `args._.slice(<declared count>)`, since `args._` holds every positional; what follows `--` is in `args._` too, passed on untouched by a command forwarding a command line of its own.
- **A launch another program makes, carrying no subcommand, is served from the root's `setup`**, which runs before dispatch: citty throws on a first positional it does not know, so a link a platform starts the program with, or a child that re-runs the executable with a path first, is recognised there and served before dispatch is reached (`packages/agent-console-server/src/services/cli/commands/agentConsoleServerCommand.ts`).
- **A tool that prints in the reader's language passes `runMain` its own `showUsage`**, printing its localized usage and exiting, since citty prints the usage before an English error and exits 1 after it; exiting inside `showUsage` answers every unknown or missing command in the reader's language (`packages/genshin-persona/scripts/genshin.ts`).
- **A failure throws** (`InvalidOperationError`), and `runMain` prints it and exits 1; `process.exitCode` is set only for a result that is not an error but still fails, such as a check reporting problems.
- **A command's behaviour is tested through its root**, `runCommand(<tool>Command, { rawArgs: [<name>, …] })` from citty, the way a shell calls it.
