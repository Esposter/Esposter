import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { bench, describe } from "vitest";

// The barrel guard's own record, relative to the package it belongs to.
const FINGERPRINT_FILE = join("node_modules", ".cache", "ctix-source-fingerprint");
// This bench rebuilds every package from cold, and the only way to do that is to delete the `dist` it is about
// To rebuild. On a CI runner that `dist` is the `package-builds` artifact every job downloaded, and one of the
// Files in it is the `@esposter/shared-node` reporter Vitest is writing these results through — so the run
// Would be deleting its own reporter to measure a build the workflow already measured by caching it. CI's
// Bench job exists to prove every `*.bench.ts` still executes; this one belongs where the committed
// `*.bench.md` is written, which is a developer's machine. Skipped here rather than excluded in the workflow
// So the reason travels with the file.
const IS_CI = Boolean(process.env.CI);
// `pnpm` is a `.cmd` shim on Windows, which Node cannot spawn without one — but `shell` cuts both ways. With
// It the whole command line goes to `cmd.exe`, which splits on whitespace, so an argument holding any has to
// Arrive already quoted; without it every argument reaches pnpm verbatim and those same quotes become part of
// The value. A `--filter` of `"!@esposter/app"` — quotes included — matches no package at all, and pnpm exits
// 0 having done nothing, which reads exactly like a workspace with nothing to build. So the quoting is applied
// On the platform that needs it and nowhere else.
const IS_SHELL = process.platform === "win32";
const quoteArgument = (argument: string): string => (IS_SHELL ? `"${argument}"` : argument);
const runPnpm = (args: string[]): string => execFileSync("pnpm", args, { encoding: "utf8", shell: IS_SHELL });
// Pnpm orders a recursive run topologically, and `--workspace-concurrency=1` is what makes that order observable:
// Each package prints while it is the only one running. Asking pnpm rather than deriving the order from the
// Manifests keeps one definition of what depends on what — the same one the real build uses. The directory comes
// Back in the same pass because a package's name does not have to match the folder holding it.
//
// The pair comes back as JSON rather than on a separator, because the separator would have to survive being
// Written as a TypeScript escape, read back as a `cmd.exe` command line and then split against a Windows path:
// A tab does not — `cmd` treats it as an argument delimiter — and every character that does is a guess about
// What a path cannot contain. `JSON.stringify` escapes the backslashes on the way out and `JSON.parse` gives
// Them back, so the quoting question never arises.
const readBuildOrder = (): { directory: string; packageName: string }[] =>
  runPnpm([
    "-r",
    "--workspace-concurrency=1",
    "--filter",
    quoteArgument("!@esposter/app"),
    "exec",
    "node",
    "-e",
    quoteArgument("console.log(JSON.stringify([require('./package.json').name, process.cwd()]))"),
  ])
    .split("\n")
    .flatMap((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine.startsWith("[")) return [];

      // eslint-disable-next-line no-restricted-syntax -- a package name and a directory, neither of which is a date
      const [packageName, directory] = JSON.parse(trimmedLine) as [string, string];
      return [{ directory, packageName }];
    });
// Module scope rather than a suite hook: Vitest fires bench() callbacks before hooks resolve. Gated on CI ahead
// Of the spawn, so a runner does not pay for a workspace walk whose every task is about to be skipped.
const packages = IS_CI ? [] : readBuildOrder();

// One task per package, declared in build order and so run in it — the serial shape a real `pnpm build:packages`
// Has, which is the only one worth reading. A parallel build is noisier than the differences being measured,
// Because packages contend for the same cores.
//
// `vs base` compares each package against the first one built, so the package holding most of the serial build is
// The smallest multiplier in the group — the only one worth optimising, and what a regression looks like here.
describe.skipIf(IS_CI)("build - packages (cold)", () => {
  for (const { directory, packageName } of packages)
    bench(
      packageName,
      () => {
        // Both `dist` and the barrel guard's fingerprint survive a build, so without this every iteration after the
        // First would measure the skip rather than the work — and a report of warm numbers reads exactly like a
        // Report of a build that got faster. The removal is milliseconds against a build of seconds.
        rmSync(join(directory, "dist"), { force: true, recursive: true });
        rmSync(join(directory, FINGERPRINT_FILE), { force: true });
        runPnpm(["--filter", quoteArgument(packageName), "run", "build"]);
      },
      // A cold build is seconds, so the runner's default ten iterations would put this bench in the tens of
      // Minutes. Three is what buys an honest `±rme` — one sample renders `±0.00%`, which reads as certainty the
      // Measurement does not have — and no warmup, because a warmup run here is just another full cold build.
      { iterations: 3, warmupIterations: 0 },
    );
});
