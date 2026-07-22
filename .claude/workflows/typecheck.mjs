// Typecheck harness for workflow scripts. The Workflow sandbox accepts plain JavaScript only (TypeScript
// syntax fails its parser), and its top-level `return` is a grammar error tsc cannot suppress — so each
// script is copied into .generated/ wrapped in an async arrow, then tsgo checks the shadow copies against
// workflow-globals.d.ts. Run with: node .claude/workflows/typecheck.mjs
import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const workflowsDirectory = dirname(fileURLToPath(import.meta.url));
const generatedDirectory = join(workflowsDirectory, ".generated");
rmSync(generatedDirectory, { force: true, recursive: true });
mkdirSync(generatedDirectory);

for (const fileName of readdirSync(workflowsDirectory)) {
  if (!fileName.endsWith(".js")) continue;
  const source = readFileSync(join(workflowsDirectory, fileName), "utf8");
  const wrapped = `const workflowBody = async () => {\n${source.replace("export const meta", "const meta")}\n};\nexport default workflowBody;\n`;
  writeFileSync(join(generatedDirectory, fileName), wrapped);
}

execSync(`pnpm exec tsgo -p "${workflowsDirectory}"`, { stdio: "inherit" });
