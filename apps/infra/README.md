# @esposter/infra

[![Apache-2.0 licensed][badge-license]][url-license]

[Pulumi](https://github.com/pulumi/pulumi) infrastructure-as-code for Esposter's Azure and GitHub resources — every cloud resource declared from TypeScript, through the Azure Native and GitHub providers.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/infra).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- ⌨️ [Commands](#commands)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

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

## <a name="commands">⌨️ Commands</a>

Run from `apps/infra/`:

```bash
pnpm build             # regenerate the barrel and compile the Pulumi program to dist/
pnpm infra:preview     # preview Pulumi changes
pnpm infra:refresh     # refresh Pulumi state from Azure
pnpm infra:up          # apply Pulumi changes
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=038758
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
