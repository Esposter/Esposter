# Esposter Infrastructure

[![Apache-2.0 licensed][badge-license]][url-license]

Pulumi infrastructure code and migration tooling for Esposter Azure resources.

### Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

This private package contains Esposter's Azure infrastructure-as-code project. It uses [Pulumi](https://github.com/pulumi/pulumi) with the Azure Native provider to manage Azure resources from TypeScript.

### Tooling

Install the Pulumi CLI before running stack commands. The `@pulumi/pulumi` dependency is the Node.js SDK used by the Pulumi program; it does not install the `pulumi` command.

```powershell
winget install Pulumi.Pulumi
# Or, if you use Chocolatey:
choco install pulumi
pulumi version
```

Install workspace dependencies from the repository root:

```powershell
pnpm i
```

### Stack Setup

Authenticate Azure locally:

```powershell
az login
az account set --subscription "<subscription-id>"
```

Create or select a stack explicitly so Pulumi does not open the interactive stack picker:

```powershell
cd packages/infra
pulumi stack init dev
pulumi config set azure-native:subscriptionId "<subscription-id>"
```

If the stack already exists:

```powershell
pulumi stack select dev
```

Use `prod` instead of `dev` when preparing the production stack.

### Project Layout

- `src/main.ts` is the Pulumi program entrypoint.
- `Pulumi.yaml` defines the Pulumi project.
- `Pulumi.dev.yaml` and `Pulumi.prod.yaml` hold stack-specific configuration.
- `src/scripts/` contains temporary migration helpers until the imported Azure resources are fully represented in Pulumi code.
- `data/` and `generated/` are temporary migration folders and should be removed after the import phase.

Migration details live in [features/azure-pulumi-migration.md](../../features/azure-pulumi-migration.md).

### Commands

Run from `packages/infra/`:

```bash
pnpm build             # type check the Pulumi project
pnpm inventory:build   # generate migration import files from CSV exports
pnpm import            # import resources from generated/azure-import-manifest.json
pnpm preview           # preview Pulumi changes
pnpm refresh           # refresh Pulumi state from Azure
pnpm up                # apply Pulumi changes
pnpm lint:fix          # auto-fix lint issues
pnpm typecheck         # type check
```

### Migration

The current repository still includes temporary migration files generated from the previous Azure asset spreadsheet. After the live Azure resources are imported and refactored into first-class Pulumi code, remove the migration-only CSV, manifest, review, and generator files.

See [features/azure-pulumi-migration.md](../../features/azure-pulumi-migration.md) for the phase-1 import workflow and remaining manual-review items.

### References

- [Pulumi import docs](https://www.pulumi.com/docs/iac/guides/migration/import/)
- [Pulumi Azure Native provider docs](https://www.pulumi.com/registry/packages/azure-native/)
- [Azure Native installation and authentication](https://www.pulumi.com/registry/packages/azure-native/installation-configuration/)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
