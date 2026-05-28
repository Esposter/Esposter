# Architecture

Cross-cutting implementation decisions for Esposter.

Use this folder for architecture that applies to multiple packages or feature areas. Keep feature-specific file maps, workflows, and schemas in `features/<area>/architecture.md`; keep planned work and checklists in `features/`.

| File                | Purpose                                                                                |
| ------------------- | -------------------------------------------------------------------------------------- |
| `azure-services.md` | Azure service ownership, storage split, EventGrid push flow, and real-time layer model |
| `file-uploads.md`   | Two-step Azure Blob SAS upload pattern and upload procedure inventory                  |

## What Belongs Here

- Durable decisions that are reused across multiple feature areas.
- Service ownership maps and cross-package data flows.
- Patterns that prevent repeated rediscovery, such as storage choice and upload mechanics.

## What Stays Elsewhere

- Feature plans, TODOs, and implementation phases: `features/<area>/` or `features/refactors/`.
- Feature-specific architecture references: `features/<area>/architecture.md`.
- Coding rules and style conventions: `.agents/skills/` and `.claude/skills/`.
- Public project documentation: `README.md` and package-level README files.
