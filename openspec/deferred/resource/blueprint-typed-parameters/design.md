# Blueprint typed parameters

Parameters that are numbers, booleans or lists, with length and numeric bounds.

## Why deferred

A parameter's value is substituted into a name or a content string, so a number or a list would need a rule for how it is written into text, and a bound on a string is a check on text the entry's own schema already runs after substitution. Allowed values cover the constraint a manifest author reaches for first, as the [blueprint resource](../../../specs/resource/blueprint-resource/design.md) holds them, and the entry schemas reject the rest.

## Revisit when

A manifest needs a parameter that is not text, such as a count of rows or a list of names, and writing it as text and parsing it in the entry has failed an author.
