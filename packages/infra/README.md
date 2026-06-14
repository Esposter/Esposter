# Esposter Infrastructure

[![Apache-2.0 licensed][badge-license]][url-license]

Pulumi infrastructure code for Esposter Azure resources.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

This private package contains Esposter's Azure infrastructure-as-code project. It uses [Pulumi](https://github.com/pulumi/pulumi) with the Azure Native provider to manage Azure resources from TypeScript.

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
cd packages/infra
pulumi stack select prod
```

### Project Layout

- `src/index.ts` is the generated source barrel.
- `dist/index.js` is the compiled Pulumi runtime entrypoint used by `Pulumi.yaml`.
- `Pulumi.yaml` defines the Pulumi project.
- `Pulumi.prod.yaml` holds stack-specific configuration.
- `docs/` contains architecture, naming, security, and roadmap notes.
- `src/resources/` contains Pulumi resource declarations grouped by Azure ARM provider namespace and resource type.

### Commands

Run from `packages/infra/`:

```bash
pnpm build             # generate exports and compile the Pulumi program to dist/
pnpm export:gen        # regenerate src/index.ts via ctix
pnpm infra:preview     # preview Pulumi changes
pnpm infra:refresh     # refresh Pulumi state from Azure
pnpm infra:up          # apply Pulumi changes
pnpm lint:fix          # auto-fix lint issues
pnpm typecheck         # type check
```

### References

- [Pulumi Azure Native provider docs](https://www.pulumi.com/registry/packages/azure-native/)
- [Azure Native installation and authentication](https://www.pulumi.com/registry/packages/azure-native/installation-configuration/)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
