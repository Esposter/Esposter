// The part of a workflow launch the workflow guard reads: the script inline, or the path of a script file, or the name
// Of a saved workflow, which carries no script the guard can read
export interface WorkflowLaunch {
  name?: string;
  script?: string;
  scriptPath?: string;
}
