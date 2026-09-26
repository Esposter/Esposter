import { TriageLabel } from "#src/models/triage/TriageLabel";
import { checkIsGitHubNumber } from "#src/services/shared/checkIsGitHubNumber";
import { runGh } from "#src/services/shared/runGh";
import { readIssue } from "#src/services/triage/readIssue";
import { readTriageLabel } from "#src/services/triage/readTriageLabel";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { parseArgs } from "node:util";

// `pnpm ai:triage:label <issue> [--dry-run]` — which of the tracker's five roles an issue is in, read off the
// Issue and applied. One label, never a second: an issue that already carries one has been triaged, by a person
// Or by an earlier run, and a re-read would talk over whatever they decided.
const {
  positionals: [issueArgument],
  values: { "dry-run": isDryRun },
} = parseArgs({ allowPositionals: true, options: { "dry-run": { default: false, type: "boolean" } } });
const issue = Number(issueArgument);
if (!checkIsGitHubNumber(issue))
  throw new InvalidOperationError(Operation.Read, "triage", "the issue argument is not a number");

const { body, labels, title } = readIssue(issue);
const triaged = labels.find(({ name }) => Object.values(TriageLabel).some((label) => label === name));
if (triaged) console.info(`#${issue} already carries ${triaged.name} — nothing to decide`);
else {
  const label = await readTriageLabel({ body, title });
  if (isDryRun) console.info(`would label #${issue} ${label}`);
  else {
    runGh(["issue", "edit", issue.toString(), "--add-label", label]);
    console.info(`labelled #${issue} ${label}`);
  }
}
