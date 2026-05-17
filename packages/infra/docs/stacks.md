# Pulumi Stacks

Pulumi stacks are isolated state and configuration records for the same Pulumi program. A stack name does not automatically filter which Azure resources are managed.

## Current State

One unified stack owns all Azure resources in the subscription. Both development (`d-*`) and production (`p-*`) resources are declared together in the Pulumi program.

The stack was renamed from `dev` to `prod` as part of v6. See [features/infra/v6.md](../../../features/infra/v6.md) for the decision record.

## Rule Of Thumb

Only run `pulumi up` after reading the preview and confirming the selected stack owns exactly the resources you intend to change.

Never use `pulumi up --skip-preview`. If an update partially succeeds or fails, run `pnpm infra:preview` again before any follow-up apply.
