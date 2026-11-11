# Blueprint typed parameters

Parameters that are numbers, booleans or lists, with length and numeric bounds, as ARM's parameter types and constraints are ([Parameters in ARM templates](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/parameters)).

## Why deferred

A parameter's value is substituted into a name or a content string, so a number or a list would need a rule for how it is written into text, and a bound on a string is a check on text the entry's own schema already runs after substitution. The allowed-values change covers the constraint a manifest author reaches for first, and the entry schemas reject the rest.

## Revisit when

A manifest needs a parameter that is not text, such as a count of rows or a list of names, and writing it as text and parsing it in the entry has failed an author.
