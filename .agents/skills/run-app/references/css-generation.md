# Generating the CSS

Read when a styling question can be settled by what UnoCSS generates: whether a utility resolves, to which property, or whether a token exists for a value.

Whether a utility resolves at all, and to which
property, is a question UnoCSS answers offline — no browser, no judgement call, no flake. It settles exactly
the class of finding that otherwise gets parked as "needs eyes on the page": whether an attributify form is
equivalent to the `class` form it replaces, whether an arbitrary value is ambiguous between two properties,
whether a token is generated for a value a dynamic binding hides from the scanner.

`pnpm ai:unocss:generate "<markup>" [filter]` prints the CSS `apps/web/uno.config.ts` generates for a fragment, keeping
the lines that mention the filter — `pnpm ai:unocss:generate '<div bg="[image:--x]" />' background`. It runs from
the repo root or `apps/web` and writes nothing into the tree, so a running dev server is undisturbed.

Filter the output, or the safelist buries the one line that answers the question. **A form that generates
nothing is the finding**, and it looks identical to a form that works: `bg-image="[var(--x)]"` produces no
rule at all, while `bg="[var(--x)]"` produces `background-color`, so a gradient written either way is lost
silently. `bg="[image:--x]"` is the one that produces `background-image`.
