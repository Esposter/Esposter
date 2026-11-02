# Page builder critique

A critique of the webpage document: a set of deterministic checks that report what is wrong with a page before it is published, shown in an editor panel and readable by an agent. It is built on the [document model](../../specs/resource/page-builder/document-model/design.md), whose nodes and styles it reads, and on the [style panel](../../specs/resource/page-builder/style-panel/design.md), whose per-breakpoint values it checks. It uses no model: every finding is a computation over the document, so it costs nothing to run and sends nothing anywhere.

## Scope

What works today: the webpage document, its nodes and their per-breakpoint styles, the device widths the canvas draws, the survey invite node, and the generic read tool pattern the resource router already uses for content.

What this change adds: one pure critique function over the document, each check as its own module, an optional critique on the webpage's resource definition, a generic read tool that answers a saved resource's critique, and a Check panel in the webpage editor. The email's checks are a follow-up in the email change, since the email editor is still being built.

## How it works

The critique walks the document once, through the children port the document model already defines, and carries two colours down the tree: each node's effective background, which is the nearest ancestor that sets one and otherwise the page's default background, and its effective text colour, which inherits as CSS inherits colour. Each node is checked against its own rules, and the findings are collected in document order.

```mermaid
flowchart TD
  DOC["the document, saved or unsaved"] --> WALK["walk the tree through the children port"]
  WALK --> BG["effective background, from the nearest ancestor that sets one"]
  BG --> TEXT{"a text node?"}
  TEXT -->|yes| READ{"both colours read?"}
  READ -->|no| UNCHECKED["finding: unchecked"]
  READ -->|yes| RATIO{"under 4.5 to 1?"}
  RATIO -->|yes| LOW["finding: low contrast, with the node id"]
  WALK --> WIDTH{"a fixed width wider than the phone device, with no override narrowing it at the phone width?"}
  WIDTH -->|yes| WIDE["finding: fixed width, with the node id"]
  WALK --> INVITE{"a survey invite?"}
  INVITE -->|yes| LOOKUP["publish state, from a lookup the server passes in"]
  LOOKUP -->|unpublished| TARGET["finding: unpublished survey, with the node id"]
```

The walk is the one pass the diagram shows. The checks are gates on the node's own values, and the one external fact, whether a survey is published, is read through a lookup the server fills in, so the function itself never reads the database and runs the same in the browser and on the server.

## Decisions

**One pure function, run in both places.** The critique is one function in the shared page builder services, called by the editor on the unsaved document and by the read tool on the saved one. The alternative was a browser-only check over the rendered canvas, which would read the true cascade through computed styles, but an agent has no canvas to read, and the panel would wait on the frame for every edit. The shared function gives both callers the same rules and the same verdict on every check that needs no colour, which is what the agent needs to trust what the panel showed. The colour checks are the one place the two differ, because only the browser can read a colour, as the colour decision below sets out.

**Checks are declared per type, read by one generic tool.** The webpage's definition in the resource definition map gains an optional critique. The generic read tool reads it off the resource's type, so a second type gains a critique by declaring one and no tool is added. The alternative was a critique tool per type, which the house rule that a feature an agent can use goes through the generic resource tools rejects.

**The browser reads a colour, and a colour it cannot compute is reported unchecked.** The style panel accepts any colour the browser accepts, including forms such as oklch and color-mix. So the editor reads each colour's value through a probe element: the probe takes the value as its colour, and the browser's computed value is read back and converted to an sRGB triple, through a one-pixel canvas where the computed form is not already sRGB. No dependency is added, because the browser already parses every syntax the panel allows. A colour the browser does not compute is reported as unchecked, never as passing, so a page is never shown as clean when the check did not run.

The alternatives were rejected for these reasons:

- **A small parser of hex, rgb and hsl.** It would silently fail on the values the panel allows, such as oklch and color-mix, and the failure would look like a pass.
- **A third-party CSS colour parser.** It would be a second reading of colour syntax beside the browser's, able to disagree with the colour the page renders with, and a dependency to keep current for a job the browser already does. No such package was read for this design, so none is named.

The critique takes each colour as a resolved sRGB value from its caller, so the function itself touches no DOM. The editor supplies the probe's values. The read tool on the server has no browser, so it supplies none: every colour check in its answer is reported as unchecked.

**Contrast is held at the normal-text threshold for every text.** WCAG 2.2 criterion 1.4.3 asks for 4.5 to 1 on normal text and 3 to 1 on large text, large meaning 18 point, or 14 point bold ([WCAG 2.2, criterion 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum)). Large text depends on the font size, which the typography sector sets per node and breakpoint, and reading it correctly means resolving the size as the cascade does. The critique holds every text to 4.5 to 1 in this version, so it never passes a text the standard fails, and it may report a large text the standard would allow. Relaxing it for large text is a later change, once the size is resolved.

**Fixed widths are checked against the narrowest device, not measured.** A fixed width wider than the narrowest device the canvas draws, with no override narrowing it at the phone width, will overflow on a phone; the tablet overrides that count are the next decision's. The check reads the value and the device width the canvas names in the page builder's device model. It does not measure rendered layout, because the agent path has no browser and the static fact covers the common fault. Text that overflows for a reason other than a fixed width is not reported, and the Notes say so.

**The survey invite's target is passed in.** Whether a survey is published is a database fact, so the function takes a lookup from its caller, and the server supplies it from the survey's publish state. The alternative was for the function to read the database, which would make it server-only and break the browser's use of it. The owner's published surveys are read only for a page that holds an invite, since only an invite asks for one: the server reads them for such a page, and the editor fetches them once an open page first holds one. The alternative was to read them for every page, which spends a query on a page with nothing to look up.

**A finding names its node by id, and its row by the id and the kind.** The canvas selects by node id, so a finding carries the id it names. One node can carry two findings, a width and a contrast, so the Check panel keys each row by the node id followed by the finding's kind, and choosing a row reads the node id back from the first part of its key. A node id holds no separator, so that first part is always the node's. The alternative was to key the row by the node id alone, which gives both rows one key and one DOM id, so keyboard focus reaches only the first.

**Text colour inherits down the tree, as CSS inherits it.** A text takes the nearest ancestor's text colour, not only its background, so the check reads the colour the browser draws it in. The alternative was to carry the background alone and check each text against the page's default black, which passes a light text inside a section that sets a light colour on the white page, a text the browser draws with low contrast.

**Colour checks read the desktop breakpoint.** A text's colour and background are read from its base style, the desktop breakpoint, and a colour that a mobile or tablet override sets is not checked. The alternative was to check each breakpoint. A finding names only its node and carries no breakpoint, so the same text failing at two breakpoints would appear twice, and the owner could not tell which breakpoint failed.

**A background image is not read.** A text is checked against the colour beneath it, and an image's pixels are never read. The alternative was to report every text over an image as unchecked, which marks each such text unchecked whatever its colours, so the panel cannot separate the texts that need a look from those that do not.

**Widths read pixels, rem and vw.** A width in pixels, in rem at the root size `ROOT_FONT_SIZE_PIXELS` names, or in vw at the narrowest device width is read. Em, percentages, vh and calc() are not, since each needs the parent's size, the viewport's height or the layout, and the agent path has no browser to lay the page out in.

**A tablet override that narrows a node counts at phone width.** The width a phone draws is the narrowest one the node's overrides set, mobile or tablet, since a tablet override applies at the phone width too. The alternative was to read the mobile override alone, as the spec's scenario names it, which would report a node that a tablet override already narrows to the phone's width.

**The contrast ratio is rounded to a fixed scale.** The ratio is rounded to the decimal places `CONTRAST_RATIO_SCALE` names, so floating-point error cannot put a text at exactly the threshold below it, which the scenario "text at exactly 4.5 to 1 is not reported" depends on. The alternative was the unrounded ratio.

**The luminance keeps WCAG 2.x's linear cutoff.** The sRGB curve switches at the cutoff `SRGB_LINEAR_CUTOFF` names, the value WCAG 2.x's formula uses. The alternative was the cutoff of the revised sRGB standard. The criterion defines its ratio with its own formula, so the critique keeps that formula's constant.

**A translucent colour is unchecked.** The reader returns three channels and no alpha, so a colour below full opacity reads as nothing and is reported unchecked. The alternative was to composite it over the colour beneath, which needs the alpha the reader does not carry. The build reads opaque colours only.

**The server reads no colour.** The read tool's reader yields no colour, so every colour check in its answer is unchecked. The alternative was a server-side reader for the colour syntaxes the panel accepts, which is the small parser the colour decision above rejects.

**A resource never saved answers an empty list.** It has no nodes, so no finding is in it, and the answer carries the content version it was read at. The alternative was to refuse it as having no content, which would refuse a draft with nothing to check.

## Procedures

| Procedure                            | Auth                                               | Input           | Purpose                                                                    |
| ------------------------------------ | -------------------------------------------------- | --------------- | -------------------------------------------------------------------------- |
| readCritique, on the resource router | the key owner's resource under the Resources scope | the resource id | answers the critique of the saved content, with the version it was read at |

The procedure takes the owner guard the other generic reads take, so it acts only on the key owner's own resources. For a type with no critique it is refused, naming the type, so an agent learns the check is absent rather than reading an empty list as a clean page.

## Failure and retry

The critique is pure, so it has no retry. A survey lookup that fails leaves its invite's finding reported as unchecked, not dropped. A saved resource that fails to read is refused as the read tool refuses any resource, and the agent may read again.

## Key files

| File                                                                    | Role after the change                                                                            |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `apps/web/shared/models/pageBuilder/WebpageDocument.ts`                 | the document the critique walks                                                                  |
| `apps/web/shared/models/pageBuilder/NodeStyle.ts`                       | the per-breakpoint, per-state style a node carries                                               |
| `apps/web/shared/models/pageBuilder/StyleBreakpoint.ts`                 | the breakpoints the mobile override is read from                                                 |
| `apps/web/shared/models/pageBuilder/PageBuilderDevice.ts`               | the device widths, whose narrowest bounds the fixed-width check                                  |
| `apps/web/shared/models/pageBuilder/SurveyInviteNode.ts`                | the survey invite whose target the lookup checks                                                 |
| `apps/web/shared/services/pageBuilder/webpageNodeChildren.ts`           | the children port the walk goes through                                                          |
| `apps/web/shared/services/pageBuilder/getNodeStyleCss.ts`               | how a node's style becomes CSS, the values the check reads                                       |
| `apps/web/shared/services/pageBuilder/constants.ts`                     | the node limit the critique's compute is bounded by                                              |
| `apps/web/shared/models/webpageEditor/data/WebpageEditor.ts`            | the webpage content schema the critique reads, unchanged                                         |
| `apps/web/shared/models/resource/ResourceDefinition.ts`                 | the resource definition, which gains the optional critique                                       |
| `apps/web/shared/services/resource/ResourceDefinitionMap.ts`            | the map each type's definition sits in, the webpage's entry gaining its critique                 |
| `apps/web/server/trpc/routers/resource.ts`                              | the generic resource router, which gains the read tool                                           |
| `apps/web/server/services/resource/readStoredResourceContent.ts`        | the saved content the read tool answers from                                                     |
| `apps/web/server/services/mcp/getMcpTools.ts`                           | the tool listing, which offers the read tool under the Resources scope                           |
| `apps/web/app/store/pageBuilder/document.ts`                            | the open, unsaved document the panel checks                                                      |
| `apps/web/app/store/pageBuilder/canvas.ts`                              | the selection a finding's selection sets                                                         |
| `apps/web/app/components/PageBuilder/Editor.vue`                        | the panel tabs, which gain the Check panel                                                       |
| `apps/web/app/services/pageBuilder/getCritiqueFindingRow.ts`            | a finding as a Check panel row, keyed by its node id and kind                                    |
| `apps/web/shared/services/pageBuilder/getPresentDefinitions.ts`         | the existing document walk the invite gate reuses                                                |
| `apps/web/shared/services/pageBuilder/critique/checkHasSurveyInvite.ts` | the gate that asks whether a page holds an invite, so a survey lookup runs only for one          |
| `apps/web/server/services/resource/readCritiqueSources.ts`              | the server's sources, which read the owner's published surveys only for a page holding an invite |

New code lands here, in a tree the change creates:

```text
apps/web/shared/services/pageBuilder/critique/   the critique function, each check in its own module, and its bench
apps/web/app/components/PageBuilder/Check/       the Check panel and its list of findings
```

## Notes

- Text that overflows its box for a reason other than a fixed width, such as a long word in a narrow column, is not reported. The canvas measures layout in the browser, and this check does not.
- The critique reads a saved document through the read tool at the version the agent read, so an agent reading it while the owner edits sees the saved state, not the panel's unsaved one.
- A type without a critique is refused by the read tool, which states the absence rather than answering an empty list.
- An agent that needs a contrast verdict reads the panel's findings in the editor, since the read tool does not give one. Fixed-width and survey findings do not depend on colour and are answered in full.
- A colour that a mobile or tablet override sets is not checked, so a page can list no finding while a phone draws low contrast.

## Sources

- [WCAG 2.2, success criterion 1.4.3 Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum), read for this design: 4.5 to 1 for normal text, 3 to 1 for large text, large meaning 18 point or 14 point bold. The critique takes the 4.5 to 1 threshold for all text.
