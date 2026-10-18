import { Element } from "#src/models/Element";
import { createGcgHilichurlSummon } from "#src/services/gcg/effects/createGcgHilichurlSummon";

export const HILICHURL_BERSERKER_ID = 303_213;

// Hilichurl Berserker, a Hilichurl summon (the wiki's Hilichurl Berserker)
export const hilichurlBerserker = createGcgHilichurlSummon(Element.Pyro);
