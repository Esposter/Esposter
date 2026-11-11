# Dashboard conditional formatting

Colouring a Table's values by a rule, a colour scale or the value of another field, as Power BI's conditional table formatting does ([Apply conditional table formatting](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-conditional-table-formatting)).

## Why deferred

A rule is a condition, a comparison value and a colour per column, and the colour has to read on both themes, so it would be a theme token and not a hex value. The reference applies it to table values only. The Table here shows exact values grouped by one column, and the chart beside it carries the shape.

## Revisit when

A Table is asked for colour by value, and the app's theme tokens give a set that reads on both themes, so a rule's colour is one token.
