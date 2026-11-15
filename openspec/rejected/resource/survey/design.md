# Survey features not taken

The survey's runner, editor and expression language are Esposter's own. The features of the SurveyJS engine that the survey does without are refused for one reason: the survey already has its own way to do each job, or the feature would add a second way to one. Each section holds one feature and its reason.

## Client validation hook

A developer hook would run a custom client-side validation function in the page a respondent sees.

**Why not:** An owner writes a survey's checks as expressions, and the runner's page check runs the required test, the answer's schema and each validator's expression ([survey runner design](../../../specs/resource/survey-runner/design.md)). A developer hook would run code the owner did not write inside the public page, for every survey that used it. The expression validators cover the checks an owner needs. The page and the server call the same functions, so a hook would also have to run on the server to agree with the page.

## Logic group builder

Nested groups of an element's conditions in parentheses, joined by AND or OR.

**Why not:** The logic builder's rows form one flat run joined by a single connective, `and` or `or`. A group in parentheses, or a connective nested inside another, is a custom expression the builder does not draw ([survey logic builder design](../../../specs/resource/survey-logic-builder/design.md)). The design rejects a nested group builder, since it would double the component for expressions a survey owner rarely writes. The Logic tab's typed expression field already holds any mix of the two, with its error and position.

## Logic rule filters

A filter on the Logic tab's list of rules, by question or by action type.

**Why not:** Esposter keeps no list of rules. Each condition belongs to the element it edits, and the Logic tab shows that element's rows ([survey layout design](../../../specs/resource/survey-layout/design.md), "Logic stays with the element it edits"). With no list across the survey, a filter by question has nothing to narrow. A filter by action type has nothing to narrow either, since the logic only shows, hides, enables and requires elements. The actions are the [deferred logic actions](../../../deferred/resource/logic-actions/design.md).

## Moving past pages with errors

An option to move on from a page that holds validation errors, and check the errors later.

**Why not:** The runner refuses to move past a page while a visible required question on it is unanswered, and names the first one for focus ([survey runner spec](../../../specs/resource/survey-runner/spec.md)). Its move function returns the blocking errors in place of the next page ([survey runner design](../../../specs/resource/survey-runner/design.md)). The server refuses a submit that leaves a required question empty ([survey respondent spec](../../../specs/resource/survey-respondent/spec.md)), so a respondent who moved past an error would reach a completion the server refuses.

## One question per page

A card view that shows a survey with one question on each screen.

**Why not:** Pages are the runner's only grouping, and the multi-page runner already moves a respondent through them with Previous and Next ([survey runner design](../../../specs/resource/survey-runner/design.md)). A survey with one page per question gives the same run through the runner it has. A card view would be a second runner mode to keep in step with the first.

## Page switcher menu

A menu in the Creator that jumps to any page of a survey from a list, so an author does not scroll the design surface to reach one.

**Why not:** Choosing a page row in the outline already selects that page, and the canvas scrolls to it ([inline-editing change](../../../changes/resource-survey-creator-inline-editing/design.md)). A second control listing the same pages beside the canvas would give an author two routes to one page. The inline-editing change rejects it for that reason, and the outline stays the one place a page is chosen.

## Survey JSON editor tab

A tab in the Creator that edits the survey's raw JSON. The [survey form engine](../../../changes/archive/2026-11-04-resource-survey-form-engine-program/design.md) does not build it.

**Why not:** The tab is a second way to write the document, beside the property grid, and it lets an owner write a state the grid's forms would refuse. The typed document is checked on every save, so a raw edit would either be refused with a path an owner has to read in JSON, or be a hole in the check. Import and export already give an owner the whole document to edit in their own tool and bring back through the same check.

## Toolbox configuration

Settings for the editor's palette: category titles and collapsible groups, a full or compact density, a subset of the question and panel kinds, and a renamed, added or reordered set of items, through a developer API or JSON.

**Why not:** The palette lists the kinds an insertion point takes, in six named groups that are constants in the app ([survey creator design](../../../specs/resource/survey-creator/design.md), `apps/web/app/services/resource/survey/constants.ts`). Each setting above is an embedder's toolbox API, and Esposter has no embedder that would write one. A custom toolbox item would be a new document kind, which changes the document's schema rather than a setting. The groups stay constants unless the app itself needs a configured palette.

## Validation message placement

An option to place a failed check's message at the top of the question box, where the default puts it, or anywhere else the owner chooses.

**Why not:** The survey fields spec requires a failed check's message to sit beside its field ([survey fields spec](../../../specs/resource/survey-fields/spec.md), "A question that fails a check shows its message beside the field"). A placement option would let an owner move the message away from the input it names, which the spec forbids. Every question keeps its message beside the field.

## Survey response export

A survey's responses exported to CSV or a file of its own, so an owner can analyse them outside the app.

**Why not:** Esposter already exports a survey's responses. A survey has no export of its own, so it gets the generic Export CSV command that serves every resource with a dataset. That command writes one flat table, with question titles as headers and untrusted answers neutralised as formulas, and CSV is its only format ([dataset CSV export spec](../../../specs/resource/dataset-csv-export/spec.md)). A second export would duplicate the command.
