# Pulumi Stacks And Environments

Pulumi stacks are isolated state and configuration records for the same Pulumi program. A stack name does not automatically filter which Azure resources are managed.

## Current State

The current Pulumi program declares both development resources (`d-*`) and production resources (`p-*`).

That means:

- selecting the `dev` stack does not automatically mean only development Azure resources are in scope;
- selecting a `prod` stack does not automatically mean only production Azure resources are in scope;
- the resources declared in TypeScript determine what Pulumi will try to manage;
- the selected stack determines which Pulumi state and config Pulumi uses for those declarations.

Because the current `dev` stack imported both `d-*` and `p-*` resources, it should be treated as the current real infrastructure state, not as a disposable sandbox.

## One Stack Option

Use one stack, such as `prod` or `main`, to manage all Azure resources in the subscription.

This is the simplest match for the current import because both development and production Azure resources are already declared together in the program.

Benefits:

- minimal migration risk;
- no duplicate import work;
- one source of truth for the current Azure subscription;
- avoids pretending the current `dev` stack is isolated.

Tradeoff:

- Pulumi preview and update always evaluate both development and production resources.

If this path is chosen, renaming the current stack from `dev` to `prod` or `main` is cleaner than creating a second stack with no state.

## Separate Stack Option

Use separate Pulumi stacks, such as `dev` and `prod`, where each stack manages only its matching resources.

This requires code changes:

- add stack-aware configuration for which environment is active;
- instantiate only resources for that environment;
- import `d-*` resources into the `dev` stack;
- import `p-*` resources into the `prod` stack;
- ensure shared subscription-level resources are deliberately assigned to one stack or extracted into a shared stack.

Benefits:

- lower blast radius per update;
- cleaner future environment parity;
- easier policy differences between development and production.

Tradeoff:

- more migration work;
- more chances to accidentally orphan or duplicate state during the split.

## Recommended Phase Order

For Esposter, the safer order is:

1. Keep the current imported stack as the real infrastructure owner until previews are clean.
2. Rename the current stack to `prod` or `main` if we keep one stack.
3. Optimize and refactor resource definitions while preserving Azure names and state.
4. Split into separate stacks only if the codebase needs true independent environment lifecycles.

## Rule Of Thumb

Only run `pulumi up` after reading the preview and confirming the selected stack owns exactly the resources you intend to change.
