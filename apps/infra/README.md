# @esposter/infra

[![Apache-2.0 licensed][badge-license]][url-license]

[Pulumi](https://github.com/pulumi/pulumi) infrastructure-as-code for Esposter's Cloudflare and GitHub resources. Every resource is declared in TypeScript, through the Cloudflare and GitHub providers.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/infra).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- ⌨️ [Commands](#commands)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

### Tooling

Install the Pulumi CLI before you run a stack command. The `@pulumi/pulumi` dependency is the Node.js SDK for the Pulumi program. It does not install the `pulumi` command.

1. Install the Pulumi CLI with one of these commands:

   ```bash
   winget install Pulumi.Pulumi
   # Or, if you use Chocolatey:
   choco install pulumi
   pulumi version
   ```

2. Install the workspace dependencies. Run this command from the repository root:

   ```bash
   pnpm i
   ```

   Check: the command ends without an error.

### Stack Setup

Secrets come only from the `esposter-infra/prod` Pulumi ESC environment, which `Pulumi.prod.yaml` imports. Do not run `pulumi config set --secret`: it writes the ciphertext into that tracked file.

1. Authenticate to Azure on the local machine:

   ```bash
   az login
   az account set --subscription "<subscription-id>"
   ```

   Replace `<subscription-id>` with your subscription ID.

2. Select the stack:

   ```bash
   cd apps/infra
   pulumi stack select prod
   ```

## <a name="commands">⌨️ Commands</a>

Run these commands from `apps/infra/`. The program still declares the Azure resources, so an untargeted `pulumi up` changes them too: pass `--target` for the Cloudflare or GitHub resources.

```bash
pnpm build             # regenerate the barrel and compile the Pulumi program to dist/
pnpm infra:preview     # preview Pulumi changes
pnpm infra:refresh     # refresh Pulumi state
pnpm infra:up          # apply Pulumi changes
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
