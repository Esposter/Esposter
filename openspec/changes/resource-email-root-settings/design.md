## Context

The email's root props are read from and written to the document's head and body: `lang`, `direction`, `title`, `fonts` (a name and a stylesheet address each), `body` (a width and a background colour), and the `attributes`, `breakpoint`, `styles` and `preview` props. The root form is `emailRootFormSchema`, an empty object, so the email's inspector has no settings panel and the email-layout design says a panel is added once a root prop earns one. The schema already refuses a font address that its scheme check does not allow, and it checks the body's attributes against MJML's grammar for the body. The webpage's root form, `WebpageRootForm`, edits its language alone and is drawn with nothing selected, on its Page tab.

## Gap analysis

| Feature                                         | Verdict                                                                                                                                                                           |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Head components as blocks [email]               | Built here for the title and the font list. The breakpoint is out, since an email has no breakpoints, and the defaults and the stylesheet block are not edited, see the decisions |
| Global email defaults and body settings [email] | Built here for the body width, the body background and the font list. Defaults for every component are out, since the email has no theme                                          |
| Language and direction of the email [email]     | Built here: both fields in the settings                                                                                                                                           |
| Email language attribute [email]                | Built here: the language field, as the webpage's Page tab has one                                                                                                                 |

## Decisions

- **With nothing selected the inspector keeps its prompt and offers the settings beside it.** The email-layout spec fixes the prompt for nothing selected, and its scenario stays true, so this change adds the settings to that state rather than replacing the prompt. Rejected: replacing the prompt with the settings, which would remove a scenario the spec still holds. Rejected: a permanent Email tab beside Content and Style, which would show the head's settings with a block selected, where they are not what the author is editing.
- **The settings are the head and body props the compile reads.** The title, language, direction, font list, body width and body background are the props a compile writes into the email's head and body. The alternative was a settings form over every head and body prop, which would include the defaults and the stylesheet block.
- **Defaults for every component are not edited.** MJML's `mj-attributes` sets a default for a whole kind of component, and the email has no theme to hold one. A default edited here would reach every field of its kind with no place for the author to see where it came from. The email-layout spec already has no Theme tab for the same reason.
- **The breakpoint and the stylesheet block are not edited.** The breakpoint is an MJML breakpoint, and an email has no breakpoints. A stylesheet block is free CSS, which the webpage's style panel refuses by design. Neither has a field in this change.
- **A font address uses the check the root schema holds.** The schema refuses an address whose scheme is not allowed, and the field shows that refusal. The alternative was a second check in the field, which could disagree with the compile at its edge.
- **The body width is a length in pixels, and its refusal is MJML's grammar.** The width is typed as a pixel length rather than as free text, and a value MJML's body grammar does not take is refused by the schema the field already reads. The alternative was free text, which would show MJML's grammar as a bare error.
- **Direction is a choice of the three values MJML takes.** Auto, left to right and right to left are the values the root's direction holds, so the choice cannot write another.
- **The font list refuses an add at its limit.** The root schema already caps the list, and the field shows the refusal rather than dropping the add silently.

## Rejected

- Editing `mj-attributes`, for the reason in the third decision.
- Free CSS in the email's stylesheet block, which is the free stylesheet the webpage refuses.

## Risks and trade-offs

- The email's title is the document title that a mail client shows, not a subject line, and the email has no subject line. The field's label says so, so the title is not read as the subject.
- The settings sit beside the prompt with nothing selected, so a settings field and a block's field can show the same name. The inspector's heading names which one is shown.

## Key files

| File                                                                | Role                                                                                                     |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `apps/web/shared/services/pageBuilder/email/emailRootFormSchema.ts` | the root form, which holds the settings fields the panel draws                                           |
| `apps/web/app/services/emailEditor/emailLayout.ts`                  | the email's layout, whose nothing-selected state offers the settings beside the prompt                   |
| `apps/web/app/components/Resource/Email/Editor.vue`                 | the blade that binds the panels to the document's root and the selection                                 |
| `apps/web/app/components/PageBuilder/Editor.vue`                    | the webpage's host, whose Page tab is the model for the email's settings panel                           |
| `apps/web/app/models/pageBuilder/WebpageRootForm.ts`                | the webpage's root form, the model for the email's form over the shared root schema                      |
| `packages/mjml-blocks/src/services/mjmlRootPropsSchema.ts`          | the root props the settings write: language, direction, title, fonts, body                               |
| `packages/mjml-blocks/src/services/createMjmlRootPropsSchema.ts`    | the root check that refuses a body attribute and a font address the grammar or the scheme does not allow |

## New code lands here

```text
apps/web/app/components/PageBuilder/Email/        the email's settings panel, drawn beside the prompt with nothing selected
apps/web/shared/services/pageBuilder/email/       the settings' form schema over the root props
```

## Sources

- [MJML's documentation](https://documentation.mjml.io/): the head's title and font, and the body's width and background, the props the settings write.
