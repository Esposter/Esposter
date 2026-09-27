// What a proposal will cost past its own files, each read off a Key files path rather than a field anyone keeps
export enum ProposalSignal {
  // A path under `apps/functions` or `apps/infra` — a deploy past the app's own
  Azure = "azure",
  // A `package.json` — a package argued in through dependency admission
  Dependency = "dependency",
  // A path under `packages/db-schema` — a migration
  Schema = "schema",
  // A path under `apps/web/server` — a procedure or a server service
  Server = "server",
}

export const ProposalSignals: readonly ProposalSignal[] = Object.values(ProposalSignal);
