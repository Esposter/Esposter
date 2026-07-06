# Architecture

Durable, cross-cutting decisions that span multiple packages or feature areas. Feature-specific maps, plans, and checklists live in `features/<area>/`; coding rules live in `.claude/skills/`.

| File                  | Purpose                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- |
| `azure-services.md`   | Azure service ownership, storage split, EventGrid push flow, and real-time layer model  |
| `datasets.md`         | Standard for serving tabular data — contract, DatasetProvider capability, row cap       |
| `environment.md`      | Environment detection across the three Nuxt runtime contexts                            |
| `file-uploads.md`     | Two-step Azure Blob SAS upload pattern and upload procedure inventory                   |
| `monorepo-tooling.md` | pnpm workspace orchestration, Lerna publishing boundary, installs, and CI runner policy |
| `platform.md`         | Cross-product layer model (identity, resources, datasets, publishing, events) + diagram |
| `publishing.md`       | Publishable capability — versioned publish copy + rate-limited read-only route          |
| `resources.md`        | Standard for product persistence and surface — resource model, capabilities, factory    |
| `serialization.md`    | How class instances survive the three transport paths (Azure Table, Nuxt payload, tRPC) |
| `server-testing.md`   | tRPC router test wiring — in-memory DB, mocked Azure services, controlled auth session  |
