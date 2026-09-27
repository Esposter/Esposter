---
title: Blueprint deploy review
description: Proposal — the Deploy dialog lists every resource a deploy will create under the name it will get, resolved live from the parameter fields, as the Azure portal's Review + create step shows what is about to be made before anything is.
model: claude-opus-5-5
---

# Blueprint Deploy Review

Deploying a [blueprint](/docs/resource/blueprint-resource) asks for its parameter values and then creates every entry at once; what it made is shown only afterwards, as the list of created resources. The names those resources get are the manifest's entry names with `{{parameter:key}}` substituted, and a key the manifest never declared is left as its literal text by design ([content token rewriting](/docs/architecture/content-token-rewriting)), so a typo in a parameter key ships as `Survey — {{parameter:clinet}}` across every deploy, found only in the explorer afterwards.

The Azure portal deploys a template by resolving its parameters first and showing the values under **Review + create** before the **Create** that runs it; Resource Manager "resolves parameter values before starting the deployment operations".

## What it adds

- **A review list in the Deploy dialog**, under the parameter fields: one row per entry, leading with its type's icon, showing the name it will be created with, recomputed as each field is typed — the same substitution the server runs (`substituteBlueprintParameterTokens`), moved to shared code so the dialog and the deploy resolve a name by one function.
- **An unresolved token is marked** on its row: a name still holding a `{{parameter:…}}` after substitution says which key the manifest does not declare. It does not block the deploy, since leaving the token is the rule the server follows; it is shown so the owner decides before twelve resources carry it.
- **An empty name blocks.** A parameter cleared to nothing that leaves an entry's name empty disables Deploy with the row saying so, rather than sending a deploy the server's pre-validation rejects.
- **Entries whose content references another entry** (`{{entry:key}}`) show that link in the row's description — "binds survey-wave" — so the wiring a deploy will make is readable before it is made.

## Key files

| File                                                                       | Role after the change                                                 |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/web/app/components/Resource/Blueprint/DeployDialog.vue`              | the review list under the parameter fields                            |
| `apps/web/server/services/blueprint/substituteBlueprintParameterTokens.ts` | moves to `shared/services/resource/blueprint/`, one resolver for both |
| `apps/web/server/services/blueprint/deployBlueprint.ts`                    | imports the resolver from its shared home                             |
| `apps/web/shared/services/resource/blueprint/constants.ts`                 | the token regexes the review reads unresolved tokens with             |

## Sources

- [Microsoft Learn — Deploy resources with Azure portal](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-portal) — values entered, reviewed under Review + create, then created.
- [Microsoft Learn — Parameters in ARM templates](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/parameters) — parameter values resolved before any deployment operation starts, and a default used when no value is given.
