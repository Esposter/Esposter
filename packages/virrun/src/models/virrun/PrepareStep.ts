// A resolved framework prepare step — never authored directly, always derived from a virrun.config `environment`
// Preset by resolvePrepareStep. `command` regenerates the framework's source-derived artifacts for the sandbox's
// Own platform; `outputs` are the workspace-root-relative dirs those artifacts land in. The prepare layer captures
// The command's writes under `outputs`, and the same `outputs` are masked from host write-back and excluded from
// The WSL source mirror so the host's copy never shadows the sandbox-generated one.
export interface PrepareStep {
  readonly command: string;
  readonly outputs: readonly string[];
}
