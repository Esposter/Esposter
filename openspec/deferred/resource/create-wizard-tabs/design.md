# Create wizard tabs (Basics → Review + create)

Azure's multi-tab create blade: Basics / Tags / Review + create with a validation summary before submit.

## Why deferred

Every create form but the Sheet's, which also takes a file, is name-only — a wizard over one field is ceremony without content.

## Revisit when

A resource type grows enough create-time settings (roughly 3+ fields or cross-field validation) that staging + a review step reduces errors.
