import type { ReserveWindow } from "../../../types";

import { RESERVE_AGENT_MODEL, RESERVE_REFUSAL_INSTRUCTION } from "../constants";
import { getReserveSummary } from "./getReserveSummary";

// The part of an agent launch the gate reads: the model it runs on and the type that may be a fork, which inherits the
// Parent's model whatever it names
export interface AgentLaunch {
  model?: string;
  subagent_type?: string;
}

// Why a launch is refused while a reserve holds, or undefined when it passes. A workflow is always refused, an agent
// Unless it runs on the reserve's model, and a fork never does. `""` in the window's name is no reserve
export const getReserveRefusal = (
  toolName: string,
  launch: AgentLaunch,
  reserveWindow: ReserveWindow,
): string | undefined => {
  if (!reserveWindow.name) return undefined;
  const isRefused =
    toolName === "Workflow" ||
    (toolName === "Agent" && (launch.subagent_type === "fork" || launch.model !== RESERVE_AGENT_MODEL));
  return isRefused ? `${getReserveSummary(reserveWindow)}. ${RESERVE_REFUSAL_INSTRUCTION}` : undefined;
};
