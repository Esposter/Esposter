# Pulumi Stacks

Pulumi stacks are isolated state and configuration records for the same Pulumi program. A stack name does not automatically filter which Azure resources are managed.

## Current State

One unified stack owns all Azure resources in the subscription. Both development (`dev-*`) and production (`prod-*`) resources are declared together in the Pulumi program.

The stack is named `prod`.

## Secrets

Every secret the stack reads lives in the `esposter-infra/prod` ESC environment, under `pulumiConfig.esposter-infra:<NAME>`, and `Pulumi.prod.yaml` imports it with its `environment:` key. `configuration.requireSecret("<NAME>")` in the program resolves from there.

Add one with:

```sh
pulumi env set esposter-infra/prod pulumiConfig.esposter-infra:<NAME> <value> --secret
```

**Never `pulumi config set --secret`.** That writes the ciphertext into `Pulumi.prod.yaml`, which is tracked in a public repository — publishing the encrypted secret to everybody and betting it on one algorithm, one key, and however long the repository outlives them. Nothing is gained: the stack already reads ESC. `scripts/src/workspace/stackConfig.test.ts` fails the build on any stack file carrying an encrypted value.

## Rule Of Thumb

Only run `pulumi up` after reading the preview and confirming the selected stack owns exactly the resources you intend to change.

Never use `pulumi up --skip-preview`. If an update partially succeeds or fails, run `pnpm infra:preview` again before any follow-up apply.
