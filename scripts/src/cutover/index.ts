import { cutoverCommand } from "#src/services/cutover/commands/cutoverCommand";
import { runCommand } from "#src/services/timing/runCommand";

// `pnpm -C scripts cutover <step> --environment <develop|production>`. Deleted at teardown with the Azure estate it reads
// (openspec/changes/infra-cloudflare-cutover/design.md)
await runCommand(cutoverCommand);
