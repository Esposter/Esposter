import { runDevSeed } from "#src/services/devSeed/runDevSeed";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

await runCommand(
  defineCommand({
    meta: {
      description: "Migrate the local D1 databases the dev server reads, then write the dev dataset into them",
      name: "dev:seed",
    },
    run: async () => {
      await runDevSeed();
      console.log("The dev dataset is in the local D1 databases the dev server reads.");
    },
  }),
);
