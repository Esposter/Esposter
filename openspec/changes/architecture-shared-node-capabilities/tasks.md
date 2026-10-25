# Tasks

## 1. Download cache

- [ ] 1.1 Write `architecture/download-cache/{spec,design}.md` from `readContentAddressedObject`, its constants and the barrel. Verify: the scenarios 'reads an object the cache holds without downloading it', 'keeps a download that hashes to its name', 'refuses a download that does not hash to its name' and 'refuses a name that climbs out of the directory' name existing tests in `packages/shared-node/src/services/cache/readContentAddressedObject.test.ts`.

## 2. Hidden child processes

- [ ] 2.1 Write `architecture/hidden-child-processes/{spec,design}.md` from `withHiddenWindow`, the five wrappers and the lint rule. Verify: the scenarios 'hides the window when the caller passes no options', 'keeps the caller's options and hides the window last' and 'a caller cannot re-show the window by passing windowsHide false' name existing tests in the five wrapper test files, and 'an undefined options argument is the options slot, not an args slot' and 'hides the window ahead of a trailing callback when the caller passes no options' name the `execSync` and `execFile` tests.
- [ ] 2.2 Add the test for the lint rule, which no test names. Verify: a lint probe file that imports `node:child_process` is reported, and the test named 'a direct import of node's child process fails lint' is seen failing with the rule's two entries reverted and passing with them restored.

## 3. Benchmark reporting

- [ ] 3.1 Write `architecture/benchmark-reporting/{spec,design}.md` from the reporter, the report builder, the Markdown formatter, the environment reader and the run options. Verify: the scenarios 'projects each benchmarking test into a group keyed by its full name, fastest task first', 'names every group when one test ran more than one comparison', 'omits tests that recorded no benchmarks' and 'throws a named error for a bench that produced no samples' name existing tests in `buildBenchmarkFileReport.test.ts`, and 'derives the vs-base multiplier from the native baseline, faster above 1 and slower below', 'renders the environment block and a section per group' and 'escapes pipe delimiters in benchmark names' name existing tests in `formatBenchmarkMarkdown.test.ts`.

## 4. Index and archive

- [ ] 4.1 Add a line for each of the three pages to `openspec/specs/architecture/README.md`. Verify: `openspec validate architecture-shared-node-capabilities --strict --no-interactive` passes, and the index links resolve.
- [ ] 4.2 Archive the change with `pnpm exec openspec archive architecture-shared-node-capabilities --yes`. Verify: the three capability folders exist under `openspec/specs/architecture/` and the change folder is gone.
