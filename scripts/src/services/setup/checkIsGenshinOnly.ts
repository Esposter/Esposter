import { GENSHIN_FLEET_AREA } from "#src/services/fleet/constants";

// Whether a machine is lent the Genshin area alone. The default `*` lends every area, so it fails this as well
export const checkIsGenshinOnly = (areas: readonly string[]): boolean =>
  areas.length > 0 && areas.every((area) => area === GENSHIN_FLEET_AREA);
