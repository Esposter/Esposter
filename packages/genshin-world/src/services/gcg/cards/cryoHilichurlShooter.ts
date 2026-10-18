import { Element } from "#src/models/Element";
import { createGcgHilichurlSummon } from "#src/services/gcg/effects/createGcgHilichurlSummon";

export const CRYO_HILICHURL_SHOOTER_ID = 303_211;

// Cryo Hilichurl Shooter, a Hilichurl summon (the wiki's Cryo Hilichurl Shooter)
export const cryoHilichurlShooter = createGcgHilichurlSummon(Element.Cryo);
