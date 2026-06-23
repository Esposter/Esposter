# Architecture

Durable, cross-cutting decisions that span multiple packages or feature areas. Feature-specific maps, plans, and checklists live in `features/<area>/`; coding rules live in `.claude/skills/`.

| File                  | Purpose                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- |
| `azure-services.md`   | Azure service ownership, storage split, EventGrid push flow, and real-time layer model  |
| `file-uploads.md`     | Two-step Azure Blob SAS upload pattern and upload procedure inventory                   |
| `monorepo-tooling.md` | pnpm workspace orchestration, Lerna publishing boundary, installs, and CI runner policy |
| `serialization.md`    | How class instances survive the three transport paths (Azure Table, Nuxt payload, tRPC) |
