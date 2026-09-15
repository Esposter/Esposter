# @esposter/infra

[![Apache-2.0 licensed][badge-license]][url-license]

[Pulumi](https://github.com/pulumi/pulumi) infrastructure-as-code for Esposter's Azure and GitHub resources — every cloud resource declared from TypeScript, through the Azure Native and GitHub providers.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs) to level up.

### Tooling

Install the Pulumi CLI before running stack commands. The `@pulumi/pulumi` dependency is the Node.js SDK used by the Pulumi program; it does not install the `pulumi` command.

```bash
winget install Pulumi.Pulumi
# Or, if you use Chocolatey:
choco install pulumi
pulumi version
```

Install workspace dependencies from the repository root:

```bash
pnpm i
```

### Stack Setup

Authenticate Azure locally:

```bash
az login
az account set --subscription "<subscription-id>"
```

Select the stack:

```bash
cd apps/infra
pulumi stack select prod
```

### Project Layout

- `src/index.ts` is the generated source barrel.
- `dist/index.js` is the compiled Pulumi runtime entrypoint used by `Pulumi.yaml`.
- `Pulumi.yaml` defines the Pulumi project.
- `Pulumi.prod.yaml` holds stack-specific configuration.
- `docs/` holds what a stack operator reads before an `up` — the Azure overview, naming conventions, security constraints, the search indexes, and the stacks.
- `src/azure/resources/` and `src/github/` hold the resource declarations, one resource per file, grouped by provider namespace and resource type.
- `src/azure/constants/` holds values shared by more than one resource file — locations, tags, role definition IDs, and settings that must stay identical across stacks.
- `src/azure/services/` holds the factories that build a repeated block of resource arguments from the few things that differ per resource.

### Commands

Run from `apps/infra/`:

```bash
pnpm build             # regenerate the ctix barrel and compile the Pulumi program to dist/
pnpm export:gen        # regenerate src/index.ts alone, via the shared generate-exports bin
pnpm infra:preview     # preview Pulumi changes
pnpm infra:refresh     # refresh Pulumi state from Azure
pnpm infra:up          # apply Pulumi changes
pnpm lint:fix          # auto-fix lint issues
pnpm test              # vitest watch mode (coverage is run from the repo root)
pnpm typecheck         # type check
```

### References

- [Pulumi Azure Native provider docs](https://www.pulumi.com/registry/packages/azure-native/)
- [Azure Native installation and authentication](https://www.pulumi.com/registry/packages/azure-native/installation-configuration/)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
