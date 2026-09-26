# Named Intermediates

Read when one call's result is about to be passed straight into another. The one-line rule is in `SKILL.md`; this page is its full statement.

- **A call's result gets a name rather than being nested into the next call**, and the name is the function's own with the `get`/`read` prefix dropped — `const activeInputResolvers = getActiveInputResolvers();` then `const update = useResolveInput(activeInputResolvers);`, never `useResolveInput(getActiveInputResolvers())`. Nesting hides a step inside a parenthesis and leaves what it produced unnamed; the extra line is what makes both readable, and it costs nothing. Holds inside a `return` too — bind the value, then build the string or the object from it. A single short argument a reader takes in at a glance (`String(value)`, `takeOne(items, index)`) stays where it is. A binding that keeps the verb (`const readPost = await readPost(…)`) is `naming/no-call-named-binding`
