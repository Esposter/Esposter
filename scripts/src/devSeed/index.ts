import { runDevSeed } from "#src/services/devSeed/runDevSeed";
import { timeCommand } from "#src/services/timing/timeCommand";

timeCommand("dev:seed");

// The run's own database address and storage connection string, read from the environment the driver sets for the run
const databaseUrl = process.env.DATABASE_URL ?? "";
if (URL.canParse(databaseUrl)) {
  const refusal = await runDevSeed(databaseUrl, process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING ?? "");
  if (refusal) {
    console.error(`The seed stopped before any write: ${refusal}`);
    process.exitCode = 1;
  } else console.log("The dev dataset is in its database and its storage emulator.");
} else {
  console.error("DATABASE_URL is not a database address, so the seed has no database to write to");
  process.exitCode = 1;
}
