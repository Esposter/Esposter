## Context

The webpage's style panel edits a fixed list of CSS properties, grouped into sectors. The list is one constant, the schema for a node's style is built from it so a property outside it is refused on save, and the renderer emits each listed property through one loop, so a property added to the list is emitted the same way as the others. The email's style panel draws a flat list of the attribute fields its component takes, read from the MJML attribute descriptors. Those descriptors name every attribute, including content attributes such as an address and a title, which a sector grouping has to place somewhere.

## Gap analysis

| Feature                                     | Verdict                                                                                                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Properties covered by the sectors [webpage] | Built here for the ten common properties the sectors lack. Background size, position and repeat are not added, see the decisions |
| Sector grouping of style properties [email] | Built here: the email's fields grouped under the webpage's sector titles, with Other for a field no sector names                 |

## Decisions

- **Each new property goes in the sector whose title it fits.** Flex wrap and float are layout, minimum height and overflow are size, z-index is position, font style and text transform are typography, and transform, transition and cursor are effects. Rejected: a sector of their own for each group, which adds sectors the author must scan for ten fields.
- **Background size, position and repeat are not added.** Each takes one value per background layer, and the layer list writes a single background image value, so a per-layer value needs the layer list to write one value per layer first. That is a change to the layer list, recorded under Not built. Rejected: adding the three as plain properties, which would apply one value to every layer of a list they cannot describe.
- **New properties are checked by the rule every property already has.** A value the browser does not support is not saved, so a z-index with a unit is refused by the same check as a color. Rejected: a number field for z-index, which would need a second check beside the browser's.
- **The email's grouping is a view over the field descriptors.** The descriptors are MJML's attribute data and stay as they are, and a constant maps each attribute name to a sector title. Rejected: a sector stored on each descriptor, which would copy MJML's attribute data into a second place. Rejected: an email-only set of sector titles, which would name the same concepts differently from the webpage.
- **A field no sector names goes under Other, last.** The email's content attributes, such as an address, a title and a name, belong to no visual sector, and hiding them would remove them from the editor. Rejected: dropping unnamed fields, which would hide an address the author must set.
- **A sector with no field for the node is not drawn.** An email button has no position attribute, so Position is not drawn for it. Rejected: an empty sector with a note, which draws an affordance the node cannot use.

## Rejected

- Renaming the webpage's sectors to the reference's names. The panel's titles are already the ones its authors read, and the reference's names would be a second vocabulary.

## Risks and trade-offs

- The email's upload field sits beside the image's address attribute in Other. The media uploads change draws its picker in the same panel, so the two changes edit one file, and the upload is built first.
- The new webpage properties rely on the inherited placeholder the panel already shows for every property, so a value inherited from a wider breakpoint is shown the same way.

## Not built

- Background size, position and repeat per background layer. See the decisions: the layer list has to write a value per layer first.

## Key files

| File                                                          | Role                                                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `apps/web/shared/services/pageBuilder/constants.ts`           | the property names and the sectors, where each new property is listed and placed             |
| `apps/web/shared/models/pageBuilder/StyleProperty.ts`         | the property schema, derived from the names, so a new name is accepted without a second list |
| `apps/web/shared/models/pageBuilder/NodeStyle.ts`             | the node's style schema, which refuses a property outside the list on save                   |
| `apps/web/shared/services/pageBuilder/getNodeStyleCss.ts`     | the renderer's loop over the property names, which emits each new property like the others   |
| `apps/web/app/components/PageBuilder/StylePanel/Index.vue`    | the webpage's sectors, drawn from the sector list                                            |
| `apps/web/app/services/pageBuilder/getStyleInheritance.ts`    | the inherited value a field shows as its placeholder, for a new property as for any other    |
| `apps/web/app/composables/pageBuilder/useEmailStyle.ts`       | the email's fields and the setter each field writes through                                  |
| `apps/web/app/components/PageBuilder/Email/StylePanel.vue`    | the email's style panel, drawn as a flat list today and as sectors after this change         |
| `apps/web/app/components/PageBuilder/Email/StyleField.vue`    | one email field, drawn the same in a sector as in the flat list                              |
| `packages/mjml-blocks/src/services/getMjmlAttributeFields.ts` | the attribute descriptors the email's sectors are a view over                                |

## New code lands here

```text
apps/web/app/services/pageBuilder/email/attributeSector.ts   the attribute name to sector title map, with Other
```

## Sources

- [GrapesJS, Style Manager](https://github.com/GrapesJS/grapesjs/blob/dev/docs/modules/Style-manager.md): the default sectors the reference groups its properties in, read for the grouping the webpage's sectors already follow.
