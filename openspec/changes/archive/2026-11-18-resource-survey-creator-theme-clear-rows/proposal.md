## Why

The survey creator's theme panel repeats one shape four times. The logo and the background picture are each a file field over a remove button, and the accent colour and the background colour are each a colour field over a clear button, all in a flex column of the same gap. The blocks differ in their field component (a file field for the two pictures, a colour field for the two colours), their label, their button wording ("Remove" for the pictures, "Clear" for the colours), their write (an upload for the pictures, a direct write for the colours) and the root prop they set, so a change to the shape, such as its gap or its disabled rule, has to be made four times. The review of the picture pair flagged the duplication and deferred it, since the root fix covers all four blocks: a shared row needs a typed way to write one root prop by key, which the theme composable does not express yet.

## What Changes

- The four field-and-clear blocks draw from one row component, or from one loop over the root props they write, whichever keeps each root prop's update typed by its key. The row takes the field component, the label, the button wording and the write as its inputs, since those are what differ between the blocks.
- The clear button's disabled rule (the prop is empty) and its write (the prop set to an empty string) are stated once.
- The panel's markup, its labels and what each control writes stay as they are.

## Capabilities

### Modified Capabilities

- `survey-creator`: none. The panel's behaviour is unchanged; only its code is shared.

## Impact

`apps/web/app/components/Resource/Survey/Creator/Theme.vue` and the row component it adds beside it. No stored data, route or response changes.
