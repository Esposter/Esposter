import { Element } from "#src/models/Element";
import { createGcgHilichurlSummon } from "#src/services/gcg/effects/createGcgHilichurlSummon";

export const ELECTRO_HILICHURL_SHOOTER_ID = 303_214;

// Electro Hilichurl Shooter, a Hilichurl summon (the wiki's Electro Hilichurl Shooter)
export const electroHilichurlShooter = createGcgHilichurlSummon(Element.Electro);
