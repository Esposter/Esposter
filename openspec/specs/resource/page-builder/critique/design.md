# Page builder critique

A critique of the webpage document: a set of deterministic checks that report what is wrong with a page before it is published, shown in the editor's Check panel and answered to an agent under the Resources scope. It is built on the [document model](../document-model/design.md), whose nodes and styles it reads, and on the [style panel](../style-panel/design.md), whose per-breakpoint values it checks. It uses no model: every finding is a computation over the document, so it costs nothing to run and sends nothing anywhere.

## How it works

The critique walks the document once, through the children port the document model defines, and carries two colours down the tree: each node's effective background, which is the nearest ancestor's that sets one and otherwise the page's default background, and its effective text colour, which inherits as CSS inherits colour. Each node is checked against its own rules, and the findings are collected in document order, a node's own before its children's.

The page's default background and text colour are the browser's white and black, the colours the published page is drawn in. A webpage's root carries a language and its theme's tokens and no colour of its own.

```mermaid
flowchart TD
  DOC["the document, saved or unsaved"] --> WALK["walk the tree through the children port"]
  WALK --> BG["effective background, from the nearest ancestor that sets one"]
  BG --> TEXT{"a text node?"}
  TEXT -->|yes| READ{"both colours read?"}
  READ -->|no| UNCHECKED["finding: unchecked"]
  READ -->|yes| RATIO{"under 4.5 to 1?"}
  RATIO -->|yes| LOW["finding: low contrast, with the node id"]
  WALK --> WIDTH{"a fixed width wider than a phone, with no override narrowing it?"}
  WIDTH -->|yes| WIDE["finding: fixed width, with the node id"]
  WALK --> INVITE{"a survey invite?"}
  INVITE -->|yes| LOOKUP["publish state, from a lookup the caller fills in"]
  LOOKUP -->|unpublished| TARGET["finding: unpublished survey, with the node id"]
  LOOKUP -->|unreadable| UNREADABLE["finding: unchecked survey, with the node id"]
```

The walk is the one pass the diagram shows. The checks are gates on the node's own values, and the one external fact, whether a survey is published, comes through a lookup its caller fills in: the editor from the owner's published surveys, the server from its own read. So the function never reads the database and runs the same in the browser and on the server.

## Decisions

**One pure function, run in both places.** The critique is one function in the shared page builder services, called by the editor on the unsaved document and by the read tool on the saved one. The alternative was a browser-only check over the rendered canvas, which would read the true cascade through computed styles, but an agent has no canvas to read, and the panel would wait on the frame for every edit. The shared function gives both callers the same rules and the same verdict on every check that needs no colour, which is what the agent needs to trust what the panel showed. The colour checks are the one place the two differ, because only the browser can read a colour, as the colour decision below sets out.

**Checks are declared per type, read by one generic tool.** The server's critique map holds each type's critique, keyed by resource type. The generic read tool looks the resource's type up in it, so a second type gains a critique by adding an entry and no tool is added. The map lives on the server, not in the shared definition map, because a type's source reader needs the database and the shared map is bundled for the client. The alternative was a critique tool per type, which the house rule that a feature an agent can use goes through the generic resource tools rejects.

**The browser reads a colour, and a colour it cannot compute is reported unchecked.** The style panel accepts any colour the browser accepts, including forms such as oklch and color-mix. So the editor reads each colour's value through a probe element: the probe takes the value as its colour, and the browser's computed value is read back and converted to an sRGB triple, through a one-pixel canvas where the computed form is not already sRGB. No dependency is added, because the browser already parses the colour syntaxes the panel allows. A reference to a theme token parses too, but the probe cannot resolve it, as the Not built section sets out. A colour the browser does not compute is reported as unchecked, never as passing, so a page is never shown as clean when the check did not run.

The alternatives were rejected for these reasons:

- **A small parser of hex, rgb and hsl.** It would silently fail on the values the panel allows, such as oklch and color-mix, and the failure would look like a pass.
- **A third-party CSS colour parser.** It would be a second reading of colour syntax beside the browser's, able to disagree with the colour the page renders with, and a dependency to keep current for a job the browser already does. No such package was read for this design, so none is named.

The critique takes each colour as a resolved sRGB value from its caller, so the function itself touches no DOM. The editor supplies the probe's values. The read tool on the server has no browser, so it supplies none: every colour a style sets is reported unchecked in its answer.

**Contrast is held at the normal-text threshold for every text.** WCAG 2.2 criterion 1.4.3 asks for 4.5 to 1 on normal text and 3 to 1 on large text, large meaning 18 point, or 14 point bold ([WCAG 2.2, criterion 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum)). Large text depends on the font size, which the typography sector sets per node and breakpoint, and reading it correctly means resolving the size as the cascade does. The critique holds every text to 4.5 to 1 in this version, so it never passes a text the standard fails, and it may report a large text the standard would allow. Relaxing it for large text is a later change, once the size is resolved.

**Fixed widths are checked against the narrowest device, not measured.** A fixed width wider than the narrowest device the canvas draws, with no override narrowing it at the phone width, will overflow on a phone; the tablet overrides count too, as the decision below sets out. The check reads the value and the device width the canvas names in the page builder's device model. It does not measure rendered layout, because the agent path has no browser and the static fact covers the common fault. Text that overflows for a reason other than a fixed width is not reported, and the Notes say so.

**The survey invite's target is passed in.** Whether a survey is published is a database fact, so the function takes a lookup from its caller, and the server supplies it from the survey's publish state. The alternative was for the function to read the database, which would make it server-only and break the browser's use of it. The owner's published surveys are read only for a page that holds an invite, since only an invite asks for one: the server reads them for such a page, and the editor fetches them once an open page first holds one. The alternative was to read them for every page, which spends a query on a page with nothing to look up.

**A finding names its node by id, and its row by the id and the kind.** The canvas selects by node id, so a finding carries the id it names. One node can carry two findings, a width and a contrast, so the Check panel keys each row by the node id followed by the finding's kind, and choosing a row reads the node id back from the first part of its key. A node id holds no separator, so that first part is always the node's. The alternative was to key the row by the node id alone, which gives both rows one key and one DOM id, so keyboard focus reaches only the first.

**Text colour inherits down the tree, as CSS inherits it.** A text takes the nearest ancestor's text colour, not only its background, so the check reads the colour the browser draws it in. The alternative was to carry the background alone and check each text against the page's default black, which passes a light text inside a section that sets a light colour on the white page, a text the browser draws with low contrast.

**Colour checks read the desktop breakpoint.** A text's colour and background are read from its base style, the desktop breakpoint, and a colour that a mobile or tablet override sets is not checked. The alternative was to check each breakpoint. A finding names only its node and carries no breakpoint, so the same text failing at two breakpoints would appear twice, and the owner could not tell which breakpoint failed.

**A background image is not read.** A text is checked against the colour beneath it, and an image's pixels are never read. The alternative was to report every text over an image as unchecked, which marks each such text unchecked whatever its colours, so the panel cannot separate the texts that need a look from those that do not.

**Widths read pixels, rem and vw.** A width in pixels, in rem at the root size `ROOT_FONT_SIZE_PIXELS` names, or in vw at the narrowest device width is read. Em, percentages, vh and calc() are not, since each needs the parent's size, the viewport's height or the layout, and the agent path has no browser to lay the page out in.

**A tablet override that narrows a node counts at phone width.** The width a phone draws is the one the cascade applies last there: the mobile override where it sets one, else the tablet's, else the base width, since a tablet override applies at the phone width too. The alternative was to read the mobile override alone, as the spec's scenario names it, which would report a node that a tablet override already narrows to the phone's width.

**The contrast ratio is rounded to a fixed scale.** The ratio is rounded to the decimal places `CONTRAST_RATIO_SCALE` names, so floating-point error cannot put a text at exactly the threshold below it, which the scenario "text at exactly 4.5 to 1 is not reported" depends on. The alternative was the unrounded ratio.

**The luminance keeps WCAG 2.x's linear cutoff.** The sRGB curve switches at the cutoff `SRGB_LINEAR_CUTOFF` names, the value WCAG 2.x's formula uses. The alternative was the cutoff of the revised sRGB standard. The criterion defines its ratio with its own formula, so the critique keeps that formula's constant.

**A translucent colour is unchecked.** The reader returns three channels and no alpha, so a colour below full opacity reads as nothing and is reported unchecked. The alternative was to composite it over the colour beneath, which needs the alpha the reader does not carry. The build reads opaque colours only.

**The server reads no colour.** The read tool's reader yields no colour, so every colour a style sets is unchecked in its answer. The alternative was a server-side reader for the colour syntaxes the panel accepts, which is the small parser the colour decision above rejects.

**A resource never saved answers an empty list.** It has no nodes, so no finding is in it, and the answer carries the content version it was read at. The alternative was to refuse it as having no content, which would refuse a draft with nothing to check.

## Procedures

| Procedure                            | Auth                                               | Input           | Purpose                                                                            |
| ------------------------------------ | -------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------- |
| readCritique, on the resource router | the key owner's resource under the Resources scope | the resource id | answers the critique of the saved content, with the content version it was read at |

The procedure takes the owner guard the other generic reads take, so it acts only on the key owner's own resources. For a type with no critique it is refused, naming the type, so an agent learns the check is absent rather than reading an empty list as a clean page.

## Failure and retry

The critique is pure, so it has no retry. A survey lookup that fails leaves its invite's finding reported as unchecked, not dropped. A saved resource that fails to read is refused as the read tool refuses any resource, and the agent may read again.

## Not built

- **Theme tokens are not resolved.** A colour the style panel picks from the page's swatches is stored as a reference to the token, `var(--color-…)`. The probe reads that reference in the editor's own document, where the page's tokens are not declared: they are declared on the canvas frame's document only, which the page's css is adopted into. The browser computes the reference as undeclared, so a text coloured from a swatch is checked against the colour the editor inherits rather than the token's colour, and a background from a swatch reads as transparent and is reported unchecked. The critique does not read the page's tokens.
- **The non-sRGB colour path is proven only against a mocked canvas.** The test environment rejects oklch, so the path that reads a colour the browser computes outside sRGB is tested by stubbing the canvas's 2D context to return fixed pixels. No test drives a real colour in another space through a browser.
- **The email's checks are not built.** Only the webpage's definition declares a critique, so the read tool refuses an email by name and the Check panel is offered on a webpage alone.

## Key files

| File                                                                     | Role                                                                                                              |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `apps/web/shared/services/pageBuilder/critique/critiqueWebpage.ts`       | the critique: one pure function over a webpage document, from the page's own colours down through its nodes       |
| `apps/web/shared/services/pageBuilder/critique/critiqueWebpageNodes.ts`  | the walk: each node's own checks, then its children's, through the children port                                  |
| `apps/web/shared/services/pageBuilder/critique/checkTextContrast.ts`     | the contrast check: a text below the threshold, or one whose colours cannot be read                               |
| `apps/web/shared/services/pageBuilder/critique/checkFixedWidth.ts`       | the fixed-width check at the phone width                                                                          |
| `apps/web/shared/services/pageBuilder/critique/checkSurveyInvite.ts`     | the survey invite check, over the publish state a lookup answers                                                  |
| `apps/web/shared/services/pageBuilder/critique/checkHasSurveyInvite.ts`  | the gate that asks whether a page holds an invite, so a survey lookup runs only for one                           |
| `apps/web/shared/services/pageBuilder/critique/getEffectiveColors.ts`    | each node's background and text colour at the desktop breakpoint, inherited from its ancestors where it sets none |
| `apps/web/shared/services/pageBuilder/critique/getEffectiveColor.ts`     | one colour: the node's own, read through the caller's reader, or else the one it inherits                         |
| `apps/web/shared/services/pageBuilder/critique/getContrastRatio.ts`      | the WCAG contrast ratio of two colours, rounded to the fixed scale                                                |
| `apps/web/shared/services/pageBuilder/critique/getRelativeLuminance.ts`  | the WCAG relative luminance of a colour                                                                           |
| `apps/web/shared/services/pageBuilder/critique/getLinearChannel.ts`      | one sRGB channel on the linear scale its luminance is weighted on                                                 |
| `apps/web/shared/services/pageBuilder/critique/getLengthInPixels.ts`     | a fixed width read in pixels, from px, rem and vw, or nothing for a length it cannot read                         |
| `apps/web/shared/services/pageBuilder/critique/getNodeStyle.ts`          | the style a node sets, or nothing for a node whose type holds none                                                |
| `apps/web/shared/services/pageBuilder/critique/constants.ts`             | the contrast threshold, the luminance weights, the page's default colours and the length units                    |
| `apps/web/shared/services/pageBuilder/critique/critiqueWebpage.bench.ts` | the bench of the critique's compute at the node limit                                                             |
| `apps/web/shared/models/pageBuilder/CritiqueFinding.ts`                  | the findings the critique reports, one variant per kind                                                           |
| `apps/web/shared/models/pageBuilder/CritiqueFindingKind.ts`              | the kinds of finding: a failure, or a check that could not run                                                    |
| `apps/web/shared/models/pageBuilder/CritiqueSources.ts`                  | what the critique reads from its caller: a colour reader and a survey lookup                                      |
| `apps/web/shared/models/pageBuilder/EffectiveColors.ts`                  | the colours a node is drawn in, each absent where none could be read                                              |
| `apps/web/shared/models/shared/SrgbColor.ts`                             | a colour as its sRGB channels                                                                                     |
| `apps/web/shared/models/pageBuilder/SurveyPublishState.ts`               | a survey's publish state as a lookup answers it                                                                   |
| `apps/web/shared/models/pageBuilder/WebpageDocument.ts`                  | the document the critique walks                                                                                   |
| `apps/web/shared/models/pageBuilder/NodeStyle.ts`                        | the per-breakpoint, per-state style a node carries                                                                |
| `apps/web/shared/models/pageBuilder/StyleBreakpoint.ts`                  | the breakpoints a node's style is set at                                                                          |
| `apps/web/shared/models/pageBuilder/PageBuilderDevice.ts`                | the device widths, whose narrowest bounds the fixed-width check                                                   |
| `apps/web/shared/models/pageBuilder/SurveyInviteNode.ts`                 | the survey invite node whose survey the lookup checks                                                             |
| `apps/web/shared/models/pageBuilder/WebpageRootProps.ts`                 | the page's language and tokens, whose tokens the critique does not resolve                                        |
| `apps/web/shared/services/pageBuilder/webpageNodeChildren.ts`            | the children port the walk goes through                                                                           |
| `apps/web/shared/services/pageBuilder/getPresentDefinitions.ts`          | the existing document walk the invite gate reuses                                                                 |
| `apps/web/shared/services/pageBuilder/getNodeStyleCss.ts`                | how a node's style becomes CSS, its breakpoints' media queries in the order the cascade applies them              |
| `apps/web/shared/services/pageBuilder/constants.ts`                      | the device widths, the breakpoint order and the node limit the critique's compute is bounded by                   |
| `apps/web/server/services/resource/ResourceCritiqueMap.ts`               | the critique of each type that has one, keyed by resource type                                                    |
| `apps/web/shared/models/resource/ReadCritiqueResult.ts`                  | the read tool's answer: the findings and the content version they were read at                                    |
| `apps/web/server/trpc/routers/resource.ts`                               | the generic resource router, which holds the read tool                                                            |
| `apps/web/server/services/resource/readCritiqueSources.ts`               | the server's sources: survey publish state for a page holding an invite, and no colour                            |
| `apps/web/server/services/resource/readStoredResourceContent.ts`         | the saved content the read tool answers from                                                                      |
| `apps/web/server/services/mcp/getMcpTools.ts`                            | turns each procedure whose meta opts into MCP into a tool, so the read tool is listed under the Resources scope   |
| `apps/web/app/composables/pageBuilder/usePageBuilderCritique.ts`         | the editor's critique: the open document's rows, with a survey lookup filled from the owner's published surveys   |
| `apps/web/app/services/shared/readBrowserColor.ts`                       | a colour read off a probe element the browser computes its value on                                               |
| `apps/web/app/services/shared/getCanvasSrgbColor.ts`                     | a colour the browser computes outside sRGB, read off a one-pixel canvas                                           |
| `apps/web/app/services/shared/parseRgbColor.ts`                          | a computed rgb colour as its channels, or nothing when it is translucent                                          |
| `apps/web/app/services/pageBuilder/getCritiqueFindingRow.ts`             | a finding as a Check panel row, keyed by its node id and kind                                                     |
| `apps/web/app/components/PageBuilder/Check/Index.vue`                    | the Check panel: the findings list, and choosing a row selects its node on the canvas                             |
| `apps/web/app/components/PageBuilder/Editor.vue`                         | the editor's tabs, which include the Check panel for a webpage                                                    |
| `apps/web/app/store/pageBuilder/document.ts`                             | the open, unsaved document the panel checks                                                                       |
| `apps/web/app/store/pageBuilder/canvas.ts`                               | the selection a finding's row sets                                                                                |

## Notes

- Text that overflows its box for a reason other than a fixed width, such as a long word in a narrow column, is not reported. The canvas measures layout in the browser, and this check does not.
- The critique reads a saved document through the read tool at the version the agent read, so an agent reading it while the owner edits sees the saved state, not the panel's unsaved one.
- An agent that needs a contrast verdict reads the panel's findings in the editor, since the read tool does not give one. Fixed-width and survey findings do not depend on colour and are answered in full.
- A colour that a mobile or tablet override sets is not checked, so a page can list no finding while a phone draws low contrast.

## Sources

- [WCAG 2.2, success criterion 1.4.3 Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum), read for this design: 4.5 to 1 for normal text, 3 to 1 for large text, large meaning 18 point or 14 point bold. The critique takes the 4.5 to 1 threshold for all text.
