# Survey JSON Editor Tab

SurveyJS's Creator has a tab that edits the survey's raw JSON. The [survey form engine](../../../changes/archive/2026-11-04-resource-survey-form-engine-program/design.md) does not build it.

## Why not

The tab is a second way to write the document, beside the property grid, and it lets an owner write a state the grid's forms would refuse. The typed document is checked on every save, so a raw edit would either be refused with a path an owner has to read in JSON, or be a hole in the check. Import and export already give an owner the whole document to edit in their own tool and bring back through the same check.
