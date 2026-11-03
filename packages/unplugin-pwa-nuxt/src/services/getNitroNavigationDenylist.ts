import type { Nitro } from "nitro/types";

import { getNavigationDenylist } from "#src/services/getNavigationDenylist";
import { getNitroNavigationRoutes } from "#src/services/getNitroNavigationRoutes";

// The server's routes as Nitro holds them now, under the base URL it serves from
export const getNitroNavigationDenylist = (nitro: Nitro): RegExp[] =>
  getNavigationDenylist(getNitroNavigationRoutes(nitro), nitro.options.baseURL);
