# Property Grid Organization

SurveyJS's property grid groups a selected element's settings into named categories, has a search box for them, and shows a help text beside each property. This record covers those three rows of Esposter's property panel.

## Why deferred

The property panel draws one flat form per kind, from the kind's schema, with its list editors beneath ([survey properties design](../../../specs/resource/survey-properties/design.md), "The form is the schema"). The kinds' forms are short, so grouping, search and hints would each add a surface with little to group or find. The schema form draws no hint for a property (`apps/web/app/components/Ui/SchemaForm`), and each help text needs its own written copy.

**Revisit when:** a kind's form outgrows one screen, which is when its grouping, search and hints start to pay.
