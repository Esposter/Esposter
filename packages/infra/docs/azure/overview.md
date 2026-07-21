# Infrastructure Overview

Both development and production resources are declared in **one unified stack**, distinguished by the `dev-`/`prod-` prefix in each resource name ([naming conventions](./naming-conventions.md)). A handful of resources — the subscription owner role assignment and the policy assignment — are shared and carry no prefix.

`pulumi stack` reports two resources more than there are source files: `pulumi:pulumi:Stack` (the stack record) and `pulumi:providers:azure-native` (the provider instance). Both are auto-managed and need no TypeScript declaration, so a mismatch of exactly two is expected rather than drift.

What each Azure service is actually used _for_ is in [azure services](/docs/architecture/azure-services); this page covers only how the declarations are laid out.

## Source Tree

One resource declaration per file, under the resource's own ARM provider namespace and type:

```
src/azure/resources/<Microsoft.Provider>/<resourceType>/<resourceName>.ts
```

The path is the ARM type verbatim, so a new resource type needs no registration anywhere — create the folder that matches its type. To see which types are currently declared, list the tree.

## Protection

Imported resources keep `protect: true`. Remove protection only as part of an explicit lifecycle change, after a clean preview confirms Pulumi state and Azure reality match.
