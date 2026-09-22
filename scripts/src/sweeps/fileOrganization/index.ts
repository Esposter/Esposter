import { readFileOrganizationFindings } from "#src/services/sweeps/fileOrganization/readFileOrganizationFindings";

// Prints candidates for the file-organization pass, one `path: <type>: <names>` per line — a candidate list
// Rather than findings, since the skill's exceptions are a roster no scan can hold, so no workspace test asserts
// It empty (`.agents/ledgers/file-organization/README.md`). A clean tree prints nothing.
for (const { names, path, type } of readFileOrganizationFindings())
  console.info(`${path}: ${type}: ${names.join(", ")}`);
