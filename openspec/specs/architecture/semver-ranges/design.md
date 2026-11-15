# semver range matching

The [outdated-dependency report](../monorepo-tooling/design.md) reads two things through [node-semver](https://github.com/npm/node-semver): whether a specifier is a dist-tag or a range (`checkIsValidRange`), and whether a package's `latest` falls inside a Renovate `allowedVersions` cap (`checkIsVersionInRange`). Those are the only two functions the `scripts` package calls, so they are the only two absorbed; `scripts/src/services/semver/` holds them, with the version parser, comparison and range grammar behind them.

The replacement follows SemVer 2.0.0 for version precedence and build metadata, and node-semver 7.8.5 for the range grammar and the prerelease rule. Its behaviour is checked against node-semver 7.8.5 over a grid of a couple hundred ranges and their versions, both with and without `includePrerelease`. The only differences left are values above `Number.MAX_SAFE_INTEGER`, which SemVer allows and #393 covers below.

## Scope

node-semver's tracker holds issues about `intersects`, `subset`, `gtr`, `ltr`, `coerce`, `inc`, `diff`, `maxSatisfying`, `minVersion`, the `Range` class, loose parsing and the CLI. None of those functions are absorbed, so none has a verdict here; each stays out of scope until a caller needs it. Upstream's `loose` option is not absorbed either, since no caller passes it.

## Verdicts

Every issue about the two absorbed functions, the version grammar and the range grammar they read, has a verdict. The in-scope verdicts, "Fixed" and "Declined", are listed below; the rest are counted: "Pinned" 17, "By design" 32, "Out of scope" 28, "Out of surface" 5. "Fixed" means the replacement differs from node-semver 7.8.5 and a regression test names the issue; the test fails against 7.8.5. "Pinned" means node-semver and the replacement agree and the upstream fixture or a named test holds it. "By design" means the maintainers said the behaviour is intended. "Declined" means a feature not built, with the reason.

| Issue                                                 | State  | Verdict  | Evidence                                                                                                                                           |
| :---------------------------------------------------- | :----- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#906](https://github.com/npm/node-semver/issues/906) | open   | Fixed    | `* \|\| 1.2.3-alpha` matches `1.2.3-alpha` here; 7.8.5 returns false. Test names #906 in `checkIsVersionInRange.test.ts`.                          |
| [#393](https://github.com/npm/node-semver/issues/393) | closed | Fixed    | 7.8.5 caps components at `Number.MAX_SAFE_INTEGER`; SemVer does not. Components compare as BigInt-exact strings here; the test names #393.         |
| [#189](https://github.com/npm/node-semver/issues/189) | closed | Declined | Upstream throws for an invalid version. The replacement returns `false`, so a bad allowed range holds nothing and the report never throws mid-run. |
| [#418](https://github.com/npm/node-semver/issues/418) | open   | Declined | Throwing on an invalid range is the breaking change the maintainer noted; `checkIsVersionInRange` returns `false` instead.                         |
| [#610](https://github.com/npm/node-semver/issues/610) | open   | Declined | SemVer ignores build metadata in precedence, so there is no build comparison to add; the replacement ignores it as SemVer does.                    |
| [#508](https://github.com/npm/node-semver/issues/508) | closed | Declined | No caller asks whether a range is simple; the regex exports upstream are not an API this package needs.                                            |
| [#350](https://github.com/npm/node-semver/issues/350) | open   | Declined | A prerelease-identifier validity helper has no caller here; `parseVersion` already rejects an invalid identifier.                                  |
| [#352](https://github.com/npm/node-semver/issues/352) | open   | Declined | A coerce-like helper for prerelease identifiers has no caller; `coerce` is out of scope.                                                           |
| [#736](https://github.com/npm/node-semver/issues/736) | open   | Declined | Letting `*` admit prereleases would change the default rule; the caller opts in with `includePrerelease`.                                          |

## Method

The fixtures are node-semver 7.8.5's own `range-include`, `range-exclude`, `range-parse`, `valid-versions`, `invalid-versions` and `comparisons` fixtures, ported as literal rows in the co-located tests. Rows that rely on `loose`, or on a version above `Number.MAX_SAFE_INTEGER` that 7.8.5 rejects, are not ported; the first is out of surface and the second is #393's fix.

Each fixed defect has a regression test that names its issue.

## Key files

Paths relative to `scripts/src/services/semver/`.

| File                               | Role                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `checkIsValidRange.ts`             | whether a specifier is a range rather than a dist-tag                    |
| `checkIsVersionInRange.ts`         | whether a version falls inside a range, for the `allowedVersions` cap    |
| `parseRange.ts`                    | the range grammar: splits a range into comparator sets                   |
| `parseComparatorSet.ts`            | one comparator set, its tokens expanded into bounds                      |
| `parseVersion.ts`                  | a version string into its parts, rejecting what SemVer rejects           |
| `compareVersions.ts`               | SemVer 2.0.0 precedence, build metadata ignored                          |
| `checkIsComparatorSetSatisfied.ts` | whether a version satisfies one comparator set, with the prerelease rule |
| `constants.ts`                     | the comparator text the parser shares, such as the any-version range     |
