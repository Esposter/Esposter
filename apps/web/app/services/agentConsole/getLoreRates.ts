import type { LoreRate } from "@/models/agentConsole/LoreRate";

import { GENSHIN_LORE_RATES_LINE_PREFIX } from "@/services/agentConsole/constants";
import { getSessionStartLine } from "@/services/agentConsole/getSessionStartLine";
import { getResult } from "@esposter/shared";
import { z } from "zod";

const loreRatesSchema = z.array(z.object({ displayName: z.string(), name: z.string(), probability: z.number() }));
// The welcome chart's rows the session-start hook carried as JSON, read from their line; a session the lore pick did
// Not draw carries no line, so the theme has no odds to show and shows none
export const getLoreRates = (sessionStartContext: string): LoreRate[] =>
  getResult(() =>
    // oxlint-disable-next-line no-restricted-properties -- the rates schema validates the payload
    loreRatesSchema.parse(JSON.parse(getSessionStartLine(sessionStartContext, GENSHIN_LORE_RATES_LINE_PREFIX))),
  ).match(
    (loreRates) => loreRates,
    () => [],
  );
