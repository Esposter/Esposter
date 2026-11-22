import { readDuplicateLiteralFindings } from "#src/services/sweeps/duplicateLiteral/readDuplicateLiteralFindings";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// Prints candidates for the file-organization pass: a literal two files hold may be a constant that already exists
await runCommand(
  defineCommand({
    meta: {
      description: "Print each string literal that two or more source files hold, with its file count",
      name: "ai:sweep:duplicate-literal",
    },
    run: () => {
      for (const { count, literal, paths } of readDuplicateLiteralFindings())
        console.info(`${count} ${literal} ${paths.join(", ")}`);
    },
  }),
);
