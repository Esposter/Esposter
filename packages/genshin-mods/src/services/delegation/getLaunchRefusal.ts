import type { AgentLaunch } from "../../models/AgentLaunch";

import { AGENT_MODEL, AGENT_MODEL_REFUSAL } from "../constants";

// Why an agent launch is refused, or undefined when it runs on the one model a subagent may. A fork never does, since
// It runs on the parent's model whatever it names
export const getLaunchRefusal = (launch: AgentLaunch): string | undefined =>
  launch.subagent_type === "fork" || launch.model !== AGENT_MODEL ? AGENT_MODEL_REFUSAL : undefined;
