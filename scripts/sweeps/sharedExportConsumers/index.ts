import { getSweepFilePaths } from "#scripts/sweeps/getSweepFilePaths";
import { getConsumerPackagePaths } from "#scripts/sweeps/sharedExportConsumers/getConsumerPackagePaths";
import { getExportNames } from "#scripts/sweeps/sharedExportConsumers/getExportNames";
import { getPackagePath } from "#scripts/sweeps/sharedExportConsumers/getPackagePath";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MINIMUM_CONSUMER_PACKAGES = 2;
const root = resolve(import.meta.dirname, "..", "..", "..");
const readText = (path: string) => readFileSync(resolve(root, path), "utf8");
const sourcePaths = getSweepFilePaths("packages/shared/src/*.ts").filter(
  (path) => !path.includes(".test.") && !path.endsWith("index.ts"),
);
// Every file outside the defining package. `packages/shared` naming its own export is the library using itself,
// So counting it would let one real consumer clear a threshold that asks for two.
const corpus = [...getSweepFilePaths("*.ts"), ...getSweepFilePaths("*.vue")]
  .filter((path) => !path.includes("/dist/") && getPackagePath(path) !== "packages/shared")
  .map((path) => [path, readText(path)] as const);

// Prints rather than exits non-zero: the ≥2-consumers rule is what earns a place in a shared package, and a `0`
// Here is an export nothing outside `packages/shared` names at all — which may still be a helper the package
// Uses internally, so the pass tells the two apart by opening the file
// (`.agents/ledgers/file-organization.md`).
for (const path of sourcePaths)
  for (const name of getExportNames(readText(path))) {
    const consumerPackagePaths = getConsumerPackagePaths(name, corpus);
    if (consumerPackagePaths.length < MINIMUM_CONSUMER_PACKAGES)
      console.info(`${consumerPackagePaths.length.toString()}  ${path} -> ${name}`);
  }
