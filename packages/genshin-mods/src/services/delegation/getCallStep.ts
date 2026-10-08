import type { DelegationCall } from "../../models/DelegationCall";

import { DelegationStep } from "../../models/DelegationStep";
import { LOOKUP_TOOLS, RESET_TOOLS, SHELL_TOOLS } from "../constants";
import { checkIsLookupCommand } from "./checkIsLookupCommand";

// A subagent's calls, and a tool that is neither a lookup nor a reset, leave the main session's count alone. A shell
// Command in the background is never a lookup: its output is not read in the turn it runs
export const getCallStep = (call: DelegationCall): DelegationStep => {
  if (call.agentId !== undefined) return DelegationStep.Neutral;
  else if (LOOKUP_TOOLS.includes(call.tool)) return DelegationStep.Lookup;
  else if (RESET_TOOLS.includes(call.tool)) return DelegationStep.Reset;
  else if (!SHELL_TOOLS.includes(call.tool)) return DelegationStep.Neutral;
  const isLookup = call.run_in_background !== true && checkIsLookupCommand(call.command || "");
  return isLookup ? DelegationStep.Lookup : DelegationStep.Reset;
};
