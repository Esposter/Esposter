# Cloning

Read when copying an object or a class instance, deeply or with overrides.

- **Cloning** — `structuredClone(obj)` for deep clones; `Object.assign(structuredClone(obj), { ...updates })` to clone+override. Never `{ ...spread }` to clone a class instance (loses prototype). **Exception**: `structuredClone(new ClassName(...))` when a plain object is explicitly required (e.g. a test's expected value beside a schema's parse output, which `toStrictEqual` compares prototype and all) — add a comment explaining why.
