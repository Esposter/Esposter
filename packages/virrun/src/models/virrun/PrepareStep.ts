// A resolved framework prepare step — never authored directly, always derived from a virrun.config `environment` preset
// By resolvePrepareStep. `command` regenerates the framework's source-derived artifacts for the sandbox's own platform;
// `outputs` are the workspace-root-relative directories those artifacts land in. The prepare layer captures the
// Command's writes under `outputs`, and the same `outputs` are masked from host write-back and excluded from the WSL
// Source mirror so the host's copy never shadows the sandbox-generated one.
export interface PrepareStep {
  readonly command: string;
  readonly outputs: readonly string[];
}
