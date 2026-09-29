import { agentConsoleServerCommand } from "#src/services/cli/commands/agentConsoleServerCommand";
import { runMain } from "citty";

await runMain(agentConsoleServerCommand);
