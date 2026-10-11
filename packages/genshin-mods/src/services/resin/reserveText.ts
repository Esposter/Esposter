import type { ReserveWindow } from "../../../types";

import { MAINTENANCE_INSTRUCTION, RESERVE_INSTRUCTION } from "../constants";
import { getReserveSummary } from "./getReserveSummary";

// The system section the reserve adds: its summary and the instruction of its tier are the only parts that vary, so the
// Text holds still for as long as the tier does
export const reserveText = (reserveWindow: ReserveWindow): string =>
  `${getReserveSummary(reserveWindow)}. ${reserveWindow.isWindDown ? RESERVE_INSTRUCTION : MAINTENANCE_INSTRUCTION}`;
