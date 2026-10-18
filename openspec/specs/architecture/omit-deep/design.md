# omitDeep

`omitDeep` in `@esposter/shared` returns a copy of a value with the named keys removed at every depth. It replaced `lodash-omitdeep`, whose one call site is the clicker's save trigger in `useReadClicker`: the trigger compares the omitted state against the previous snapshot, so the copy has to be stable across ticks and must drop the ticking counters from class instances as well as plain objects.

## How the walk treats a value

The walk copies rather than mutates. An array is mapped element by element. Any object whose tag is `Object` is copied key by key with the named keys skipped, and this includes class instances and Vue reactive proxies of them. Everything else is returned by reference: primitives, functions, and the built-ins that carry internal slots (`Date`, `Map`, `Set`, `RegExp`, typed arrays, `Promise`, `Blob`), since a key walk would destroy their slots.

The return type is `DeepOmit<T, TKey>`, which mirrors the same rule: a built-in is kept as a leaf, an array keeps its shape including tuples and readonly, and an object loses the named keys at every depth.

## Upstream

Every issue and pull request on `siberiacancode/lodash-omitdeep` was read with its comments before the replacement was written. None reports a defect in the object walk; the defects the audit did find are the ones the replacement's tests name below.

| Upstream                                                                                              | Verdict                                    | Proof                                                                                                                                                                                                                            |
| :---------------------------------------------------------------------------------------------------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#1 omitByDeep usage example](https://github.com/siberiacancode/lodash-omitdeep/issues/1)             | False positive — documentation gap         | The README was corrected in 2022 and again in 2023 (the maintainer's comments on the issue)                                                                                                                                      |
| [#2 v1.1.1 doesn't have any TS types](https://github.com/siberiacancode/lodash-omitdeep/issues/2)     | False positive — fixed upstream            | Fixed in 1.2.0, per the maintainer's comment; the replacement is typed by its own `DeepOmit`                                                                                                                                     |
| [#5 Version 1.4.0 is ESM only](https://github.com/siberiacancode/lodash-omitdeep/issues/5)            | False positive — packaging, fixed upstream | Fixed in 1.4.1; the replacement is ESM by construction, built by our own tsdown                                                                                                                                                  |
| [#6 Version 1.5.1 breaks CJS again](https://github.com/siberiacancode/lodash-omitdeep/issues/6)       | False positive — packaging, fixed upstream | Fixed in 1.5.3, per the maintainer's comment; no CJS build is carried                                                                                                                                                            |
| [#7 1.6.0 doesn't contain any code files](https://github.com/siberiacancode/lodash-omitdeep/issues/7) | False positive — packaging, fixed upstream | Fixed in 1.6.1, per the maintainer's comment; the package is not installed                                                                                                                                                       |
| Pull request [#3 release/@1.3.0](https://github.com/siberiacancode/lodash-omitdeep/pull/3)            | False positive — release                   | Formatting and overload declarations in `omitDeep.ts`; no runtime change                                                                                                                                                         |
| Pull request [#4 delete old eslint conf](https://github.com/siberiacancode/lodash-omitdeep/pull/4)    | False positive — tooling                   | Removes a stale ESLint configuration file                                                                                                                                                                                        |
| Not filed — found by characterization                                                                 | In scope — defect                          | `omitDeep` walks a reactive class instance, so its keys are omitted; the upstream returns the instance unchanged. The test `walks a reactive class instance, so its keys are omitted` fails on the upstream code and passes here |

## Narrowings

- **Key paths are not carried.** Upstream reads `"a.b"` as a path into a nested object. No caller uses it, so each argument is a literal key name.
- **Keys are given as arguments only.** Upstream also accepts an array of keys. The replacement takes them as rest arguments, which is all the one caller passes.
- **Class methods are typed but not copied.** A method on a class prototype is not an own enumerable property, so the walk drops it, while the type keeps a function-typed member. `Clicker` inherits `toJSON` this way, which is why `ToData` names `toJSON` explicitly.

## Key files

| Path                                                 | Role                                |
| ---------------------------------------------------- | ----------------------------------- |
| `packages/shared/src/util/object/omitDeep.ts`        | The walk and its built-in rule      |
| `packages/shared/src/util/types/DeepOmit.ts`         | The return type, mirroring the walk |
| `apps/web/app/composables/clicker/useReadClicker.ts` | The save trigger, the one call site |

## Sources

- [siberiacancode/lodash-omitdeep](https://github.com/siberiacancode/lodash-omitdeep), the upstream package and its tracker.
- [lodash `omit`](https://lodash.com/docs/4.17.15#omit), whose path semantics the upstream inherited and this replacement does not carry.
