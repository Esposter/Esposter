# Custom Expression Functions

SurveyJS lets a developer register a custom function for its expressions, and an asynchronous function whose result arrives later. This record covers both developer APIs.

## Why deferred

Each function is one module in the expression package, registered inside the package by its lowercased name ([survey expression design](../../../specs/resource/survey-expression/design.md)). A registration API would open that map to a caller outside the package, which the design keeps closed. An asynchronous function would make a check or a calculated value wait on a result, and the language evaluates over a context whose answers are already read.

**Revisit when:** a second consumer needs a function the registry does not hold.
