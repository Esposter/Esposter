# Email layout

The email editor on the [editor shell](../resource-editor-shell/design.md), as the guided pole's email case. It is a part of the [editor layout program](../resource-editor-layout-program/design.md) and it changes the editor's arrangement, not the [email editor](../../specs/resource/page-builder/email/design.md)'s document, its MJML blocks, its compile or its preview text.

The email differs from the webpage in what it must tell the reader. A webpage is drawn by the reader's own browser, and an email is read by a mail client that draws only what its table-based markup allows. The editor therefore has two views of one document, the design the author edits and the compiled message a client receives, and the compile can refuse or warn.

## How it works

| Region    | Edge        | Opens        | Modes  | Holds                                                                                                   |
| :-------- | :---------- | :----------- | :----- | :------------------------------------------------------------------------------------------------------ |
| Bar       | top, docked | always       | both   | the mode switch, the dataset picker, the preview text field, the device toggle and the problems surface |
| Blocks    | start       | on demand    | Design | tabs Blocks and Structure: the palette, with its Merge fields category, and the layers tree             |
| Inspector | end         | with content | Design | the selection's tabs, below                                                                             |
| Canvas    | the rest    | always       | both   | the design canvas in Design, the compiled message in Preview                                            |

The inspector has two selection kinds. With nothing selected it shows the email's own settings, the head's root props such as its default attributes. With a node selected it shows two tabs, Content and Style, which are the content and the MJML attribute fields the page builder draws. An email has no Theme tab today, and no per-breakpoint style tab, since an email carries no breakpoints.

```mermaid
flowchart TD
  MODE{"the mode"} -->|Design| EDIT["Blocks, the design canvas and the inspector"]
  MODE -->|Preview| VIEW["the compiled message at the device width, no editing regions"]
  EDIT -->|"an edit settles"| COMPILE["the compile runs on the server"]
  COMPILE --> MESSAGES["the validator's messages"]
  MESSAGES --> SURFACE["the problems surface in the bar"]
  VIEW --> HTML["the last good html, kept when a compile is refused"]
  COMPILE -->|"refused"| HTML
  SURFACE -->|"a message that names a node"| SELECT["the node is selected"]
```

**The compile's messages are findings.** The preview already compiles the open document on the server and keeps the last good message when a compile is refused. Its validation messages, shown today in an alert above the preview, become findings in the problems surface, in both modes, so an author in Design sees that an edit broke the markup without switching to Preview. A message that names a node selects it, and a refused compile is an error finding while the preview keeps its last good html.

**The bar holds what the email needs at a glance.** The dataset picker and the preview text, which a recipient's inbox shows beside the subject, are fields of the email and stay one press away. The device toggle sits in the bar and applies to both modes, since the design canvas and the preview both draw at the chosen width. Import MJML is occasional and sits in the bar's overflow menu.

**Structure stays a tab.** The layers tree is the keyboard path to every move, the single-pointer alternative a drag needs, so it is kept as a tab beside Blocks and not removed because the email nests shallowly. MJML's rules put a section above its columns and a column above its content, so the canvas already shows the structure as bands and columns, and the tree is the way to it without a pointer.

**A compact window** keeps the canvas and opens Blocks and the inspector as sheets from their buttons.

## Decisions

- **Preview is a mode that removes the editing regions.** The compiled message is what a client receives, so a preview drawn beside the editing panes is drawn at the wrong width. Rejected: a split view with Preview beside the design, which halves both.
- **The compile's messages join the problems surface.** An alert above the preview is seen only in Preview, after the edit. Rejected: leaving the alert, which tells the author in the one mode they are not editing in.
- **The device toggle is in the bar for both modes.** The width is a property of how the message is viewed, not of one mode. Rejected: the toggle above the canvas only in Design, which leaves Preview with its own.
- **No Theme tab and no per-breakpoint tab.** The email has no theme today and no breakpoints, and a tab with nothing to show is what the survey's layout removes. Rejected: keeping the page builder's tabs for uniformity.
- **Structure is kept for the keyboard.** See above. Rejected: dropping the layers tree because none of the email builders read in full documented one, since they are pointer tools and the repo holds a keyboard path for every move.
- **The bar is a docked region the reader sizes.** Its controls wrap on a narrow window, so one fixed row would clip them. The region holds one row at its default and a reader drags it taller, within a range. Rejected: a fixed one-row region, and a bar that folds its controls into the overflow menu, which would hide the dataset and the preview text the author edits.
- **The email has its own editor type.** The webpage and the email have different regions, so one reader state under the page builder's key would hold both layouts' sizes, and an id they share would take the other's size. Rejected: the shared page builder member the shell design named, which keeps the two sizes in one record.
- **A region with several panels draws tabs.** The inspector's Content and Style and the blocks' Blocks and Structure are one region each, and the reader chooses between them. The shell drew only the first panel, so the shell now draws a tab strip labelled by the shell's `panelNameMap`, which names every panel, the way `regionNameMap` names every region. Rejected: a second region for each tab, which would dock two panels where one fits, and a tab strip in each registry entry, which would hold the reader's choice outside the layout's state.
- **The registry binds each component to the blade's state.** The palette, the canvas's drag and the key commands are the blade's own composition, which no store holds, and the repo bans `provide` and `inject`. So each registry entry is a function that renders its component with the state the blade holds, which the shell draws with no props. Rejected: a store for the drag, which would outlive the open document it belongs to.
- **Preview compiles in Design too, so its messages reach the bar.** Preview is mounted beneath Design, so the findings are the compile's whatever the mode. This compiles once per settled edit in both modes, where it compiled only in Preview. Rejected: compiling on entering Design alone, which would miss an edit made there before a switch.
- **The root form holds no field.** The preview text is the bar's, so the settings panel with nothing selected draws nothing today. The panel stays, since the design names default attributes as the next root props, and the lead decides whether an empty panel should wait for a field.

## Not in this change

- **Email client and dark-mode previews.** See the [deferred idea](../../deferred/resource/email-client-and-dark-previews/design.md).
- **New email checks.** Contrast, links and alternative text are computations over the document and a later change; the problems surface lists the validator's messages today.
- **Sending, a subject line and a plain-text version.** Sending is its own [deferred idea](../../deferred/resource/email-sending/design.md). Stripo documents a subject and a preheader in a message-settings form and Klaviyo documents a plain-text version in a separate editor, so both are known shapes, and neither is designed here.

## Key files

| File                                                           | Role                                                                                        |
| :------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `apps/web/app/components/Resource/Email/Editor.vue`            | the blade on the editor shell: the layout, the registry and the compile's findings          |
| `apps/web/app/components/PageBuilder/Email/Bar.vue`            | the bar: the mode switch, the dataset, the preview text, the device and the problems        |
| `apps/web/app/services/emailEditor/emailLayout.ts`             | the email's layout, its panels and the names the shell draws its regions and tabs under     |
| `apps/web/app/composables/pageBuilder/usePageBuilderEditor.ts` | the page builder's editing composition, which the blade calls beside the webpage's own copy |
| `apps/web/app/components/PageBuilder/Editor.vue`               | the shared arrangement, which the email no longer mounts and the webpage's layout replaces  |
| `apps/web/app/components/PageBuilder/Palette.vue`              | the palette, registered as the Blocks tab                                                   |
| `apps/web/app/components/PageBuilder/Layers.vue`               | the layers tree, registered as the Structure tab                                            |
| `apps/web/app/components/PageBuilder/Canvas/DeviceToggle.vue`  | the device toggle, which the bar mounts and the webpage's arrangement still mounts          |
| `openspec/specs/resource/page-builder/email/design.md`         | the email editor's design, whose shell and preview sentences this supersedes                |
| `openspec/specs/resource/email-preview-text/design.md`         | the preview text the bar's field binds                                                      |

## Sources

- [MJML's documentation](https://documentation.mjml.io/): sections hold columns and columns hold content, which the document's accepted types already hold and the insertion menu mirrors.
- [Stripo's editor guide](https://support.stripo.email/en/articles/6448082-new-editor-how-does-stripo-editor-work) (fetched): blocks and structures in panels on the left, a settings panel, and a switch between the desktop and mobile versions in the top toolbar.
- [Klaviyo's guide to its template editor](https://help.klaviyo.com/hc/en-us/articles/4407911841435) (fetched): a preview that checks the desktop and mobile layouts, and a test send from the preview sidebar.
- [Stripo's built-in dark mode](https://stripo.email/en/blog/built-in-dark-mode-in-stripo-how-stripo-helps-you-test-emails-faster) (fetched): a dark preview in the editor labelled indicative, which the deferred idea records.
- [Beefree's configuration parameters](https://docs.beefree.io/beefree-sdk/readme/installation/configuration-parameters): a mobile design width and merge tags as configured parts of an email editor, which the device toggle and the dataset picker are.
- [Mailchimp's new builder](https://mailchimp.com/help/design-an-email-new-builder/): content blocks, layouts and a desktop and mobile switch in one editor.
