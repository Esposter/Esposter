import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { TMXMapParsed } from "#src/models/tmx/parsed/TMXMapParsed";
import { parseNumberAttribute } from "#src/services/parseNumberAttribute";
import { withoutUndefined } from "#src/services/withoutUndefined";

export const createTmxMap = (attributes: TMXAttributes): TMXMapParsed =>
  Object.assign(
    new TMXMapParsed(),
    withoutUndefined({
      backgroundcolor: attributes.backgroundcolor,
      compressionlevel: parseNumberAttribute(attributes.compressionlevel),
      height: parseNumberAttribute(attributes.height) ?? 0,
      hexsidelength: parseNumberAttribute(attributes.hexsidelength),
      infinite: parseNumberAttribute(attributes.infinite) ?? 0,
      nextlayerid: parseNumberAttribute(attributes.nextlayerid) ?? 0,
      nextobjectid: parseNumberAttribute(attributes.nextobjectid) ?? 0,
      orientation: attributes.orientation ?? "",
      parallaxoriginx: parseNumberAttribute(attributes.parallaxoriginx),
      parallaxoriginy: parseNumberAttribute(attributes.parallaxoriginy),
      renderorder: attributes.renderorder ?? "",
      staggeraxis: attributes.staggeraxis,
      staggerindex: attributes.staggerindex,
      tiledversion: attributes.tiledversion ?? "",
      tileheight: parseNumberAttribute(attributes.tileheight) ?? 0,
      tilewidth: parseNumberAttribute(attributes.tilewidth) ?? 0,
      version: parseNumberAttribute(attributes.version) ?? 0,
      width: parseNumberAttribute(attributes.width) ?? 0,
    }),
  );
