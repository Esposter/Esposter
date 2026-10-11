// The part of an agent launch the delegation guard reads: the model it runs on and the type that may be a fork, which
// Inherits the parent's model whatever it names
export interface AgentLaunch {
  model?: string;
  subagent_type?: string;
}
