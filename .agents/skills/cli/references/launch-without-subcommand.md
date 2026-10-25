# A launch with no subcommand

Read when a program is started by another program with no subcommand, such as a platform link or a child that re-runs the executable with a path first.

- **A launch another program makes, carrying no subcommand, is served from the root's `setup`**, which runs before dispatch: citty throws on a first positional it does not know, so a link a platform starts the program with, or a child that re-runs the executable with a path first, is recognised there and served before dispatch is reached (`packages/agent-console-server/src/services/cli/commands/agentConsoleServerCommand.ts`).
