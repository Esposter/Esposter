# Editor guardrails

How a guided editor keeps its reader from making a mistake. It is the third part of the [editor layout program](../resource-editor-layout-program/design.md), and it applies the enforcement ladder's first rung to an interface: where a wrong action can be made impossible to express, the editor does not offer it, and where it cannot, the editor says what is wrong and where.

It changes no document model and no check's rules. The accepted types a slot carries, the survey check and the page builder's critique stay as they are. This change decides what the reader sees of them.

## How it works

There are three layers, in the order a reader meets them: an action that is never offered, an action that is offered with a reason it is unavailable, and a problem that is found after the fact and shown with its place.

```mermaid
flowchart TD
  ACT["the reader reaches for an action"] --> ACCEPT{"does the target accept it, by the core's accepted types?"}
  ACCEPT -->|"never, at this point"| ABSENT["not offered at this point"]
  ACCEPT -->|"valid elsewhere"| REASON{"valid here?"}
  REASON -->|no| DISABLED["offered disabled, with the reason"]
  REASON -->|yes| DO["the edit lands as one core command"]
  DO --> CHECK["the editor's check runs after the edit"]
  CHECK --> FINDINGS["findings: a node, a severity, a message"]
  FINDINGS --> SURFACE["the problems surface: a count in the bar and a list"]
  SURFACE -->|"choose a finding"| SELECT["its node is selected and scrolled into view"]
  FINDINGS -->|"an error, in an editor that gates its save"| GATE["the save is refused and the editor shows not saved"]
  GATE --> SURFACE
```

**Never offered.** An insertion point is a place in the document: after the selected element, at the end of a page, inside a section. Its menu lists the kinds the slot there accepts, taken from the core's accepted types for that slot, so an email's insertion inside a column never offers a section and a survey's page never offers a panel's own children. A palette drag lights only the slots that accept the dragged kind, which the editors already do, and the insertion menu adopts the same rule. A kind no slot accepts here is absent, since offering it can only produce a refusal.

**Offered with a reason.** An action that is valid somewhere but not at the reader's selection is shown disabled with its reason: Move out at the top level says it is already there, Move down on the last element says it is last. This is the shell's disabled-with-reason item, and the reason comes from the same command that would refuse the edit, so the two cannot disagree.

**Found afterward.** Some rules cannot be enforced by what is offered, since they hold between two elements: a name that two questions share exists only once both do, and the edit that fixes it must not be refused. Those are findings. Every editor's check reports them in one shape, a node, a severity and a message, and one surface lists them.

## The problems surface

The surface is one component in the top bar. It shows a count of the findings, none when there are none, and opens a list. Each row names the node it concerns by the title the layers tree gives it and carries the message. Choosing a row selects the node and scrolls it into view, so a reader goes from a count to the element in one step. The list follows the document: the check runs after each edit, so a fix removes its row and an edit that breaks a rule adds one.

A finding is an error or a warning. An editor that gates its save on its check gates on errors. The survey maps every issue to an error, since its save is refused while one stands. The webpage's critique reports warnings, since a low contrast or a fixed width does not stop a publish. The email maps its validator's messages the same way, by the severity the validator gives them.

A refused save is not a transient alert. The editor keeps the reader's edit, as it does now, and the surface stays on its error count with the editor's save state reading not saved, until the findings clear and the next save lands.

## Per editor

| Editor  | Never offered                                                                   | Found afterward                                                   |
| :------ | :------------------------------------------------------------------------------ | :---------------------------------------------------------------- |
| Survey  | Kinds a page or a panel does not accept; move targets that do not take the node | The survey check: a clashing name, a rule that cannot hold        |
| Email   | Anything MJML does not nest: a section inside a section, an empty column        | The validator's messages                                          |
| Webpage | Kinds a slot's allow list refuses                                               | The critique: contrast, a fixed width, an unpublished survey link |

The survey's logic builder, the existing delete-reference warning and the page builder's allow lists already refuse what they refuse. This change adds nothing to what a document accepts and only moves the refusal to before the action.

## Decisions

- **Offer only what the slot accepts, rather than refusing afterward.** An insertion menu that lists every kind and refuses most of them spends the reader's attention on choices that were never valid. Hick's law prices a longer menu in time. Rejected: listing every kind with a refusal on choice, which is what the palettes do today.
- **Disable with a reason what is valid elsewhere, and absent what is never valid here.** Absent for a kind the slot cannot take, disabled for an action the selection could take were it elsewhere. A reader learns from a disabled action why, and an absent kind teaches nothing and costs nothing. Rejected: disabling every refused kind, which fills a menu with items that can never be used.
- **Problems are one surface and one shape.** The survey's alert, the webpage's tab and the email's alert are three presentations of one thing. Rejected: keeping each editor's own, which is why a reader of one editor cannot find the problems in another.
- **The check runs after each edit.** The rules are computations over the document, so a run is cheap and a finding never lags the edit that caused it. Rejected: running at save only, which tells the reader after the work is done, as the survey does now.
- **A name clash is a finding, not a refused edit.** An edit that resolves a clash would be refused as well, since the clash exists only between two elements. This keeps the settled decision that the check gates the save and not each edit.
- **A save is refused by errors only.** A warning informs and never blocks. Rejected: blocking on every finding, which would make a contrast warning stop a publish.
- **A finding names its node by the id the editor's selection holds.** The survey creator selects by `selectedId` (`apps/web/app/store/survey/creator.ts`), the page builder and the email editor by the canvas's node id (`apps/web/app/store/pageBuilder/canvas.ts`), and the webpage critique already names its node by id. A pointer goes stale when the node moves, and an id survives a move and an undo. Rejected: the JSON pointer the survey check reports, which a move invalidates.
- **A finding about the document as a whole names no node.** A survey's calculated value has no id (`SurveyCalculatedValue`), so its finding concerns the survey itself. The empty id is the absent string the editors already select, and it selects nothing. Rejected: a sentinel node per editor, which every editor would have to draw.
- **A severity is the token it is drawn in.** `EditorFindingSeverity` takes the `error` and `warning` token values, which `UiStatus` already says a severity string is, so `UiStatusIconMeaningMap` marks a finding with no map of its own. Rejected: a second severity enum whose values repeat the tokens.
- **The check's run waits for the edit to settle.** This refines the decision above: the settle scenario and task 1.3 name a settle delay, so a finding trails its edit by at most the autosave's delay (`RESOURCE_AUTOSAVE_DEBOUNCE_MS`) and clears on the same beat as the save that carries the fix. Rejected: a delay of its own, which would drift from the save.
- **The surface emits the node's id, and the editor reveals the node.** The surface sits in the top bar and cannot reach a canvas, and each editor renders its own. An editor selects the node it is handed and brings into view the element its render stamps with that id, which is `data-node-id` on the page builder's canvas. Rejected: the surface scrolling by a query of its own, since it would reach a canvas it does not own.
- **The critique's findings run through the settle-delayed check.** `usePageBuilderCritique` computes the webpage's findings with `useEditorFindings`, the computed every editor's check reads, so a finding clears on the save that carries its fix, as in the other editors. The Check panel's rows still read the critique on each edit. Rejected: a plain mapping beside the rows, which would clear a finding on the keystroke rather than on the save.
- **Every critique finding is a warning, the unchecked kinds included.** The Check panel draws an unchecked colour or survey as information, but `EditorFindingSeverity` holds only the error and warning tokens, and the critique states that a check which could not run is never a pass. Rejected: leaving the unchecked kinds off the surface, which would give a page the critique could not read the same clean count as a page it read and passed.
- **A webpage's save is never gated on its findings.** The save path (`saveWebpage` in `apps/web/app/store/webpageEditor/index.ts`) reads no finding, and no publish path reads the critique, so a warning refuses nothing and no critique finding can be an error. The scenario 'A warning does not refuse a save' pins the save landing on a page holding one.

## Not in this change

- **New rules.** No check gains a rule here. A new rule is a change to the check and its own spec.
- **A graph view of the logic.** The survey's logic is a rules list and stays one. A map of the jumps between questions, as Typeform draws, is a later idea and not designed here.

## Key files

| File                                                                      | Role                                                                     |
| :------------------------------------------------------------------------ | :----------------------------------------------------------------------- |
| `packages/headless-block-editor/src/services/getAcceptedTypes.ts`         | the kinds a slot accepts, which an insertion menu lists                  |
| `packages/headless-block-editor/src/services/getAcceptingSlotPointers.ts` | every slot that accepts a node, which a move target list reads           |
| `packages/headless-block-editor/src/services/checkAcceptedType.ts`        | the refusal an edit makes, whose reason a disabled action shows          |
| `apps/web/app/composables/survey/useSurveyCreatorCommands.ts`             | the survey's insert and move commands, which return no edit when refused |
| `apps/web/app/composables/pageBuilder/usePageBuilderCritique.ts`          | the page builder's findings, mapped to the one shape                     |
| `apps/web/app/services/pageBuilder/getCritiqueEditorFinding.ts`           | one critique finding as a warning finding naming its node                |
| `apps/web/app/components/Resource/Survey/Editor.vue`                      | where the survey check runs before a save                                |
| `apps/web/app/components/Resource/Survey/Creator/Layers.vue`              | the layers tree whose titles name a finding's node                       |
| `apps/web/app/models/editor/EditorFinding.ts`                             | the one finding shape each editor's check maps to                        |
| `apps/web/app/composables/editor/useEditorFindings.ts`                    | an editor's check run once its document settles                          |
| `apps/web/app/components/Editor/Problems.vue`                             | the problems surface: a count in the top bar and the list of findings    |

## Sources

- [Microsoft Forms branching](https://support.microsoft.com/en-us/office/use-branching-logic-in-your-form-0a092a1c-8fe4-441c-9fc6-cd0aad3b52b2), [Google Forms sections](https://support.google.com/docs/answer/141062?hl=en) and [Typeform's questions that cannot be logic conditions](https://help.typeform.com/hc/en-us/articles/5821097529620-Why-doesn-t-my-question-work-with-logic): choices narrowed to what is valid before the author picks, Typeform's condition picker listing only the question kinds a condition can be built on. The never-offered layer.
- [Qualtrics survey flow](https://www.qualtrics.com/support/survey-platform/survey-module/survey-flow/survey-flow-overview/): a change to the flow committed with Apply or Revert, which is the destructive-confirmation pattern the repo already holds.
- [MJML's documentation](https://documentation.mjml.io/): the nesting rules an email's insertion menu mirrors, already held by the document's accepted types.
- [Stripo's spam testing](https://stripo.email/blog/email-spam-testing-what-triggers-spam-filters-and-how-to-avoid-them-with-stripo/): a check run inside the editor on every plan and reported to the author, the shape of the problems surface's email findings.
- [Unlayer's content audit](https://docs.unlayer.com/builder/content-settings/content-audit) (fetched): an Audit tab that flags missing alternative text, missing links in buttons and menus and missing image addresses before the design is finished, and is a paid feature. The problems surface, and the checks a document can answer without a service.
- [GrapesJS's components](https://grapesjs.com/docs/modules/Components.html): a component's draggable and droppable options restrict what may be dropped into it, the same idea as a slot's accepted types.
- [Laws of UX, Hick's law](https://lawsofux.com/hicks-law/), already cited by the [design sources](../../specs/architecture/design-sources/design.md): the cost of a longer menu.
