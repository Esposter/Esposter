# `pluralize`

Read when a string carries a count, or `no-restricted-syntax` refuses a `""`/`"s"` ternary.

`${count} ${pluralize("result", count)}`. The hand-rolled `${count === 1 ? "" : "s"}` is a `no-restricted-syntax` error in script and template alike, and this is what it is banned for: `pluralize` lives in `#shared/util/text/pluralize` and selects through `EN_US_PLURAL_RULES` (`Intl.PluralRules`), so the ternary is not even equivalent: the rules object is what decides, and it is the seam a non-English locale changes. The inline ternary also gets written per surface and drifts — the same count is "1 result" here and "1 results" there.

The selector is the literal `""`/`"s"` pair and nothing about what surrounds it, so it catches a suffix built in a variable as readily as one written next to the count — and it catches a non-plural `s` too, as in `http${isSecure ? "s" : ""}`, which disables the rule on the line with that reason. Narrowing it to a plural context is not available: neither the count nor the word is in the node.

```ts
pluralize("result"); // → "results" (count defaults to 2)
pluralize("result", count);
```
