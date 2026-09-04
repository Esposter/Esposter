import type { VirrunConfiguration } from "#src/models/virrun/VirrunConfiguration";

import { BackendType } from "#src/models/virrun/BackendType";
// Which backend the repo ASKED for, before any host-capability degrade. The schema defaults an omitted `backend` to
// Os, so only an absent config file reaches the fallback here — but it is the same default either way, and it lives
// In one place because two consumers read it for opposite reasons: resolveBackend to pick a backend, and the run to
// Tell whether the one it got is the one that was wanted. Restating `?? Os` at the second site is how a run starts
// Reporting "os backend unavailable" for a repo that explicitly configured `auto`.
export const resolveRequestedBackend = (configuration: undefined | VirrunConfiguration): BackendType =>
  configuration?.backend ?? BackendType.Os;
