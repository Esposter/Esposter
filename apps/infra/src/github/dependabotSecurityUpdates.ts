import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// Renovate writes every version in this repository (`renovate.json`), vulnerabilities included through
// `osvVulnerabilityAlerts`, so Dependabot's own pull requests would be a second bot bumping the same manifests.
// They would also arrive against `main` — the one base CodeRabbit reviews on arrival — and each would spend the
// Hourly review slot the release lives on. The alerts themselves stay on in `repositoryVulnerabilityAlerts`:
// What is off here is only the pull request GitHub opens by itself. It is declared rather than left alone
// Because an undeclared setting is one a click in the settings page flips with no diff to show for it.
export const dependabotSecurityUpdates: github.RepositoryDependabotSecurityUpdates =
  new github.RepositoryDependabotSecurityUpdates(
    "dependabotSecurityUpdates",
    { enabled: false, repository: repository.name },
    { protect: true },
  );
