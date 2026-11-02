<!-- Draft of a comment for issue 10936 on ubugeeei-prod/vize. Not posted. Post it only when the migration is complete and the owner approves. -->

# Comment on #10936: the same comparison on a real Nuxt app and three Vue packages

This comment adds numbers from real code to the numbers from the generated corpus. The targets are the app project of a Nuxt monorepo and three Vue component packages. Each path reports the same diagnostics as `vue-tsc`, with one exception. The mapper reports 15 diagnostics on the app project that `vue-tsc` does not report. Each of the 15 is reduced in the batch of issues <batch list filled in when posted>.

## Environment

Apple M1, 16 GiB RAM, macOS, Node.js `<version read from .node-version when posted>`. The tools are `vize` 0.652.0, `tsrs` 0.20.1-ts7.1.0-beta and `vue-tsc` 3.3.11 on `typescript-native-bridge` 6.0.3-bridge.19.tsgo.7.0.2, which is a `typescript` backed by tsgo.

Every run is a fresh process. The OS page cache was not flushed, because the machine had no passwordless `sudo` for `purge`. The word "cold" below means that the cache folder of `vize`, `node_modules/.vize` and the incremental build info of `nuxt typecheck` were deleted before each run. The word "warm" means two priming runs, discarded, and then five measured runs. Cold has three measured runs. The two paths of a target alternate, and the first path rotates. A few light commands (file reads, `git` and API calls) ran on the machine during the warm phase.

## Results

Wall time in seconds, median with range. `vue-tsc` runs `vue-tsc --noEmit`, and the mapper runs `tsrs --fast --runExternalCode`, in each package. On the app project the two commands take `-p` for the tsconfig that Nuxt generates, and the mapper's tsconfig extends it and adds the `vize` content mapper.

Cold:

| Target      |           `vue-tsc` | `vize` mapper + `tsrs` | Ratio | Peak memory, `vue-tsc` / mapper |
| :---------- | ------------------: | ---------------------: | ----: | ------------------------------: |
| Package 1   |    1.08 (1.06–1.42) |       0.53 (0.50–0.55) |  2.0x |                   0.9 / 0.2 GiB |
| Package 2   |    1.10 (1.08–1.14) |       0.25 (0.25–0.26) |  4.4x |                   0.7 / 0.2 GiB |
| Package 3   |    6.51 (6.14–6.71) |       1.73 (1.66–1.75) |  3.8x |                   3.9 / 1.0 GiB |
| App project | 26.71 (25.97–26.75) |       6.32 (6.09–6.66) |  4.2x |                   7.7 / 3.2 GiB |

Warm:

| Target      |           `vue-tsc` | `vize` mapper + `tsrs` | Ratio | Peak memory, `vue-tsc` / mapper |
| :---------- | ------------------: | ---------------------: | ----: | ------------------------------: |
| Package 1   |    1.15 (1.14–1.26) |       0.53 (0.52–0.56) |  2.2x |                   0.9 / 0.2 GiB |
| Package 2   |    1.12 (1.10–1.13) |       0.26 (0.25–0.28) |  4.3x |                   0.7 / 0.2 GiB |
| Package 3   |    6.90 (6.68–7.35) |       1.88 (1.84–1.90) |  3.7x |                   3.9 / 1.0 GiB |
| App project | 25.15 (24.66–26.36) |       6.82 (6.66–6.88) |  3.7x |                   8.0 / 3.3 GiB |

Peak memory is the maximum resident set size that `/usr/bin/time -l` reports for the command. The median user time on the app project is 97 s for `vue-tsc` and 17 s for the mapper in the cold runs.

The program of the app project has 17,159 files, about 1.07 million lines of definitions and 0.50 million lines of TypeScript, as `vue-tsc --extendedDiagnostics` reports them.

The full `nuxt typecheck` of the app runs five projects with incremental build info. Its median is 60.76 s cold (range 49.58–61.97 s) and 51.23 s warm (range 48.75–59.18 s), with 0 diagnostics and a peak of about 8 GiB. It is not comparable with the single-project rows.

## Phases

One run with `--extendedDiagnostics` on the app project, outside the medians. `tsrs` with the mapper prints parse 2.80 s, check 3.31 s, "Content mapper request wait time" 2.69 s and total 6.16 s. `vue-tsc` on the bridge prints parse 2.15 s and bind 0.34 s, and no check time.

## Not run

- Per-file timings. `tsrs` does not support `--generateTrace`. `vue-tsc --generateTrace` writes a trace and then stops with "Debug Failure", so the file is cut off and holds `createSourceFile` and `bindSourceFile` events only. `vize check --profile-json` stops with "native TypeScript runtime is invalid" because `typescript` here is the tsgo-backed one. With the `tsrs` binary given as its checker, it had not finished after five minutes on a virtual project of 4,857 files, and the run was stopped.
- A cold run with a flushed page cache.
- The Vue mapper. These rows compare the `vize` mapper with `vue-tsc` only.
- Other hardware or another operating system.

## Reproduction

```sh
# In each package
vue-tsc --noEmit
tsrs --fast --runExternalCode

# In the app
vue-tsc --noEmit -p .nuxt/tsconfig.app.json
tsrs --runExternalCode --noEmit -p tsconfig.vize.json
```

`tsconfig.vize.json` extends `./.nuxt/tsconfig.app.json` and adds `"contentMappers": [{ "package": "vize", "extensions": [".vue"] }]` and `"vueCompilerOptions": { "composables": { "useTemplateRef": ["useTemplateRef"] } }`. Raw per-run results: <attach when posted>.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
