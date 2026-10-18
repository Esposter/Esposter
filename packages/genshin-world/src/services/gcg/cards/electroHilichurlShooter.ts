import { Element } from "#src/models/Element";
import { createGcgHilichurlSummon } from "#src/services/gcg/effects/createGcgHilichurlSummon";

// Electro Hilichurl Shooter, a Hilichurl summon (the wiki's Electro Hilichurl Shooter)
export const electroHilichurlShooter = createGcgHilichurlSummon(Element.Electro);
