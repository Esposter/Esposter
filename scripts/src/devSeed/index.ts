import { runDevSeed } from "#src/services/devSeed/runDevSeed";
import { timeCommand } from "#src/services/timing/timeCommand";

timeCommand("dev:seed");
await runDevSeed();
console.log("The dev dataset is in the local D1 databases the dev server reads.");
