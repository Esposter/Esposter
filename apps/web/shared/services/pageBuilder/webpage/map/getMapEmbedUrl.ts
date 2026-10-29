import { MAP_EMBED_URL } from "#shared/services/pageBuilder/webpage/map/constants";

export const getMapEmbedUrl = (address: string, zoom: number) =>
  `${MAP_EMBED_URL}?${new URLSearchParams({ output: "embed", q: address, z: String(zoom) })}`;
