## Context

The webpage's critique is one pure function over the webpage document: it walks the nodes, carries each node's effective background and text colour down the tree, and checks each node against its own rules. Its colour reader is supplied by the caller, so the browser reads colours through a probe and the server reads none. The email is an MJML document, not a webpage document, so its node shapes differ. Its colours are attributes of MJML components, its containers hold background attributes, and its head may set defaults for a kind of component. Its text blocks are rich text, so the headings sit inside a text's ProseMirror content. The compile and its validator already run on the server and refuse only invalid markup.

## Gap analysis

| Feature                                                  | Verdict                                                                                                                                                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link, heading and contrast checks over the email [email] | Built here as three checks in one email walk: a button or navbar link with no address or text, a heading out of order or empty, and text below the contrast threshold |

## Decisions

- **The email has its own walk, and shares only the arithmetic.** The contrast ratio and the luminance are the webpage's, so the two editors cannot disagree about a ratio. The walk itself is the email's own, because an email's nodes and its colours are read from different places. Rejected: one walk parameterised by document kind, since the webpage's walk reads style props and the email's reads MJML attributes, and a shared walk would branch on both.
- **Findings are warnings, never errors.** The email's validator errors already refuse a save, so a contrast warning refusing one too would stop an email the compile accepts. Rejected: errors for links and headings, which would block a save on a judgement the author may keep on purpose.
- **A text's background is the nearest one set above it.** The nearest container's background attribute wins, then the body's, then white, the colour a mail client draws under an email. Rejected: checking every text against white, which passes a light text inside a dark column and fails a dark text inside one.
- **A text's colour is its own, else black, and a head default for its kind makes it unchecked.** An MJML head default sets the colour the compile draws, and the check cannot attribute that colour to the text it reads, so a text whose colour comes from a head default is reported unchecked rather than read as black. Rejected: checking the default black without reading the head, which passes a text the compile draws light.
- **Headings are compared in document order across the email.** A heading is compared with the heading before it in the whole email, so a level 1 in one block followed by a level 3 in the next is reported. The first heading has nothing before it and is not compared. Rejected: an order check inside each text block, which passes that pair.
- **Links are the button and the navbar link.** Both hold their address and their label as their own attributes, so an empty one is visible to the check. A link inside a text block wraps words the author wrote, so the check does not read it. Rejected: reading links inside rich text, which would need the text's marks and their extent to find an empty one.
- **Colours are read as the webpage reads them.** The editor's probe supplies them, and the server supplies none, so every colour a text sets is unchecked in an agent's read. Rejected: a server colour parser, for the reason the webpage's critique gives.
- **The read tool answers for emails.** The email's entry joins the critique map, so an agent can find a dead link in a saved email. Rejected: keeping the refusal by name, which leaves an agent unable to learn that a button goes nowhere.

## Rejected

- Errors for any of the three checks, for the reason in the second decision.
- A check on every image's alternative text, since the validator already refuses an image with none.

## Risks and trade-offs

- The contrast check reads colours in the editor's own document, so a colour the probe cannot read is unchecked, and the finding says so rather than passing the text.
- The heading and link checks read the document, so an email that compiles to a different structure in a mail client is judged on its source. The checks are not a rendering test.

## Not built

- Mail client and dark-mode colours. The check reads the colours the author set, and a client that inverts them is not simulated. See the deferred [client and dark previews](../../deferred/resource/email-client-and-dark-previews/design.md).
- Large text at 3 to 1. Like the webpage, every email text is held to 4.5 to 1 until the size is resolved for email.

## Key files

| File                                                                    | Role                                                                                      |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `apps/web/shared/services/pageBuilder/critique/getContrastRatio.ts`     | the contrast ratio the email's contrast check reuses, rounded to the same scale           |
| `apps/web/shared/services/pageBuilder/critique/getRelativeLuminance.ts` | the luminance the ratio is computed from, shared with the webpage                         |
| `apps/web/shared/services/pageBuilder/critique/constants.ts`            | the contrast threshold and the default colours a page or an email without one is drawn in |
| `apps/web/shared/services/pageBuilder/critique/critiqueWebpage.ts`      | the webpage walk, the model for the email's walk and its order of findings                |
| `apps/web/shared/models/pageBuilder/CritiqueFinding.ts`                 | the finding kinds, which gain the email's link, heading and unchecked-colour kinds        |
| `apps/web/app/services/pageBuilder/getCritiqueEditorFinding.ts`         | the editor's row for a finding, a warning naming its node                                 |
| `apps/web/app/services/shared/readBrowserColor.ts`                      | the editor's colour reader, a probe the browser computes its value on                     |
| `apps/web/app/components/Editor/Problems.vue`                           | the problems surface, which lists the email's rows and selects the node a row names       |
| `apps/web/app/components/Resource/Email/Editor.vue`                     | the email editor, which mounts the email's findings beside the validator's messages       |
| `apps/web/server/services/emailEditor/getEmailValidatorMessages.ts`     | the validator's messages, which stay findings of their own severity beside the critique   |
| `apps/web/server/services/resource/ResourceCritiqueMap.ts`              | the critique of each type, which gains the email's entry                                  |
| `apps/web/server/services/resource/readCritiqueSources.ts`              | the server's sources, which read no colour for an email                                   |
| `packages/mjml-blocks/src/services/constants.ts`                        | the all-types key the head's defaults are read under                                      |
| `packages/mjml-blocks/src/services/components/mjButton.ts`              | the button's address and label, the attributes the link check reads                       |
| `packages/mjml-blocks/src/services/components/mjNavbarLink.ts`          | the navbar link's address and label                                                       |

## New code lands here

```text
apps/web/shared/services/pageBuilder/email/critique/   the email walk: links, headings and contrast, one check per file
apps/web/app/composables/emailEditor/useEmailCritique.ts   the open email's findings, rebuilt when the document settles
```

## Sources

- [Unlayer's content audit](https://docs.unlayer.com/builder/content-settings/content-audit), read for the archived guardrails design: missing links in buttons and menus is the check the link rule takes.
- [WCAG 2.2, success criterion 1.4.3 Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum): 4.5 to 1 for normal text. The check takes the threshold for all text, as the webpage's does.
