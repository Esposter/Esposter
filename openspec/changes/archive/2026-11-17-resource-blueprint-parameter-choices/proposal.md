## Why

Every blueprint parameter is free text, so a manifest that needs one of a few values, such as a region or a plan, relies on the deployer typing it exactly. A wrong spelling deploys a whole set of resources with a name or a binding nobody meant. The reference lets a parameter list its allowed values and fails the deployment when a value is not among them.

## What Changes

- A parameter takes an optional list of allowed values.
- The Deploy dialog shows a parameter with a list as a choice of those values, in place of a text field, and prefills its default.
- A deploy whose value for such a parameter is not in the list is refused before anything is created.
- A parameter's default must be one of its allowed values, and a manifest that says otherwise is refused on save.

## Capabilities

### Modified Capabilities

- blueprint-resource (resource/blueprint-resource): a parameter can list its allowed values, and deploy enforces them.

## Impact

The parameter model gains one optional list and the Deploy dialog one control. A stored parameter without a list stays free text, so no stored blueprint changes. A captured blueprint has no lists, since capture records content and not choices.
