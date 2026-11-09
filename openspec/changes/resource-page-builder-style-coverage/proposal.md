## Why

The webpage's style panel has no field for ten common properties, among them flex wrap, float, minimum height, z-index, transform and transition, so a common layout need has no control. The email's style fields are one flat list of every attribute a component takes, so a button shows its address next to its padding with no grouping, and an author looks through the whole list for one field.

## What Changes

- The webpage's style panel offers flex wrap and float in Layout, minimum height and overflow in Size, z-index in Position, font style and text transform in Typography, and transform, transition and cursor in Effects.
- An unsupported value for one of these is not saved, as for every other property.
- The email's style fields are grouped into the webpage's sector titles, with a field no sector names under Other.
- A sector with no field for the node is not drawn.

## Capabilities

### Modified Capabilities

- `resource/page-builder/style-panel`: the panel offers ten more common properties, each in one sector.
- `resource/page-builder/email`: the email's style fields are grouped into sectors.

## Impact

The property list and the sector list gain entries, and the renderer already emits every listed property. The email's style panel draws its fields in sectors over the same field descriptors it reads today.
