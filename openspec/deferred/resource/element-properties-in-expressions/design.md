# Element Properties in Expressions

SurveyJS lets an expression read another element's properties, such as its title. This record covers that read.

## Why deferred

The expression package has no survey object. It reads answers and calculated values only, and the design keeps the survey's live functions out of the language, since the package has no survey object to read them from ([survey expression design](../../../specs/resource/survey-expression/design.md)). An element's title would need that object inside the package, so the boundary has to be redesigned first.

**Revisit when:** the boundary that keeps the survey object out of the expression package is redesigned.
