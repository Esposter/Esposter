# The localStorage key registry

Read when adding, renaming or enumerating a persisted browser key.

Every localStorage key lives in **one** registry, `app/services/shared/LocalStorageKey.ts` — a `RoutePath`-style `as const` object. Never scatter `*_LOCAL_STORAGE_KEY` constants across `services/*/constants.ts`, and never inline a literal into `useLocalStorage("literal")` or `localStorage.getItem("literal")`. Nothing checks the values for uniqueness, so one registry does not make an overlap impossible — it makes one visible, by putting every key where a reader can see them together.

- **PascalCase entries, kebab-case string values.** Boolean-valued keys follow the boolean naming rule (`IsFooCollapsed`).
- **Parameterised keys are functions** returning the composed string (`` Foo: (barId: string) => `foo:${barId}` ``, like `RoutePath.Foo(id)`). Derive a prefix for enumeration from the empty call — `LocalStorageKey.Foo("")` → `"foo:"` for `.startsWith` / `.slice`.
- **Keep existing string values byte-identical** when migrating scattered keys into the registry. Changing a value orphans data users have already persisted.
- Not every `*_KEY` constant belongs here — `FOO_KEY` may be a property key inside a model's JSON. Only storage keys.
