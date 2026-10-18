# Cloning

Read when copying an object or a class instance, deeply or with overrides.

- **Cloning** — `structuredClone(obj)` for deep clones of plain data; `Object.assign(structuredClone(obj), { ...updates })` to clone+override. Neither `structuredClone` nor `{ ...spread }` keeps a class instance's prototype — both return a plain object with no methods and no `instanceof` — so a class instance is rebuilt by handing the clone to its constructor: `new Row(Object.assign(structuredClone(toRawDeep(row)), overrides))`. **Exception**: `structuredClone(new ClassName(...))` when a plain object is explicitly required (e.g. a test's expected value beside a schema's parse output, which `toStrictEqual` compares prototype and all) — add a comment explaining why.
- **Data holding functions** — `structuredClone` throws on a function, so options an engine takes with callbacks in them (a chart's formatters and events) are copied with `clonePlainDeep` from `@esposter/shared`: every array and plain object copied, out of any reactive proxy, and every function, date or class instance shared.
