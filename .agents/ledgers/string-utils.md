# String Utils

`pluralize` over a count ternary, `normalizeString` as the default trim, sanitizers at the Zod boundary, and token matching in authored content.

## Find recipe

The blank test `=== ""` on a raw value is `restrictedSyntaxes.ts`'s selector, so it is not a recipe. A `||` fallback on text has no pattern that sees whether its left side is raw, since that is a fact of its type, so the recipe finds the shape and the unit reads each hit:

```bash
# a `||` fallback to a constant or a non-empty literal: a fallback to "" renders the same as a blank value, so it is no hit
git grep -nE ' \|\| *([A-Z][A-Z_]{3,}\b|"[^"]|`)' -- apps packages scripts
```

Read each hit's left side. A text a person or an input may leave untrimmed (a label, a title, a status message) is the hit, and takes `checkIsBlankText(value) ? fallback : value`; an id, a flag or generated text is not.
