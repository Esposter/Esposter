# omitDeep

`omitDeep` in `@esposter/shared` returns a copy of a value with the named keys removed at every depth. Its one call site is the clicker's save trigger in `useReadClicker`: the trigger compares the omitted state against the previous snapshot, so the copy has to be stable across ticks and must drop the ticking counters from class instances as well as plain objects.

## How the walk treats a value

The walk copies rather than mutates. An array is mapped element by element. Any object whose tag is `Object` is copied key by key with the named keys skipped, and this includes class instances and Vue reactive proxies of them. Everything else is returned by reference: primitives, functions, and the built-ins that carry internal slots (`Date`, `Map`, `Set`, `RegExp`, typed arrays, `Promise`, `Blob`), since a key walk would destroy their slots.

The return type is `DeepOmit<T, TKey>`, which mirrors the same rule: a built-in is kept as a leaf, an array keeps its shape including tuples and readonly, and an object loses the named keys at every depth.

## Upstream

Every issue and pull request on `siberiacancode/lodash-omitdeep` was read with its comments before the replacement was written. None reports a defect in the object walk; the defects the audit did find are the ones the replacement's tests name below. The other seven items are counted here and stay on the [tracker](https://github.com/siberiacancode/lodash-omitdeep/issues?q=is%3Aissue): false positive 7 (packaging, fixed upstream 3; fixed upstream 1; documentation gap 1; release 1; tooling 1).

| Upstream                              | Verdict           | Proof                                                                                                                                                                                                                            |
| :------------------------------------ | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Not filed — found by characterization | In scope — defect | `omitDeep` walks a reactive class instance, so its keys are omitted; the upstream returns the instance unchanged. The test `walks a reactive class instance, so its keys are omitted` fails on the upstream code and passes here |

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

- [lodash-omitdeep on GitHub](https://github.com/siberiacancode/lodash-omitdeep), the upstream package and its tracker.
- [lodash `omit`](https://lodash.com/docs/4.17.15#omit), whose path semantics the upstream inherited and this replacement does not carry.
