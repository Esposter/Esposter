# Long IN Lists and JSON Arrays

Read when a query filters on a list of ids that may be long, or reads a JSON text column that holds an array. The one-line rules are in `SKILL.md`; this page is their full statement.

- **A list is bound once, as a JSON array.** D1 caps a statement at 100 bound parameters, so an `IN` list with one parameter per value fails once the list is long. `inJsonArray(column, values)` and `notInJsonArray(column, values)` from `@esposter/db` (`packages/db/src/services/shared/inJsonArray.ts`, `notInJsonArray.ts`) bind the whole list as one JSON string and read it back with `json_each`, so the cap does not limit the list's length. An empty list matches nothing for `inJsonArray` and excludes nothing for `notInJsonArray`.
- **A JSON text array is read with `json_each`.** SQLite has no array type, so an array column is `text({ mode: "json" })`, as `ancestorIds` in `packages/db-schema/src/schema/post/postsInPost.ts` is, and a membership test over it selects from `json_each` of the column. No array operator is available for it.
- **A size bound reads the array with `json_array_length`**, as the room filter's word bound does (`packages/db-schema/src/schema/message/roomFiltersInMessage.ts`).
- A multi-row insert's chunk size is the other D1 cap, `D1_MAX_BOUND_PARAMETERS` (`references/queries.md`).
