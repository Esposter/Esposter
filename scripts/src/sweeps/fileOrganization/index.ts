import { readFileOrganizationFindings } from "#src/services/sweeps/fileOrganization/readFileOrganizationFindings";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// Prints candidates for the file-organization pass, one `path: <type>: <names>` per line — a candidate list
// Rather than findings, since the skill's exceptions are a roster no scan can hold, so no workspace test asserts
// It empty (`.agents/ledgers/file-organization/README.md`). A clean tree prints nothing.
await runCommand(
  defineCommand({
    meta: {
      description: "Print each source file that is a file-organization candidate, with its type and the names it holds",
      name: "ai:sweep:file-organization",
    },
    run: () => {
      for (const { names, path, type } of readFileOrganizationFindings())
        console.info(`${path}: ${type}: ${names.join(", ")}`);
    },
  }),
);
