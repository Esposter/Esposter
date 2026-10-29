import type { ReserveWindow } from "../../../types";

import { MAINTENANCE_INSTRUCTION } from "../constants";
import { getReserveSummary } from "./getReserveSummary";

// The system section the reserve adds: the summary is the only part that varies, with the window it names and the line
// That window has passed, so the text holds still while neither changes
export const reserveText = (reserveWindow: ReserveWindow): string =>
  `${getReserveSummary(reserveWindow)}. ${MAINTENANCE_INSTRUCTION}`;
