// The part of a workflow launch the reserve gate reads: the script inline, or the path of a script file, or the name of a
// saved workflow, which carries no script the gate can read
export interface WorkflowLaunch {
  name?: string;
  script?: string;
  scriptPath?: string;
}
