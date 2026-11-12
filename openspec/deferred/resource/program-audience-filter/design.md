# Program audience filter

A rule on a program that limits who is in scope by a condition on the audience's columns, such as only people whose region is one value, so one audience sheet serves several programs.

## Why deferred

Which people are in scope is a question about a sheet's columns, and the sheet already has a filter model with its own column types and operators. A program rule that filters would either copy that model or bring it into the program's content and its Setup blade, which is a second place to keep a filter in step with the sheet's. The cheaper answer exists today: a sheet per audience, or the sheet's own filter saved as a view the program binds.

## Revisit when

An owner keeps copying one sheet to make several audiences, or the sheet's saved filter can be bound as an audience, so a program takes a filtered audience without a rule of its own.

## Cheaper interim

Bind a sheet that holds only the people in scope.
