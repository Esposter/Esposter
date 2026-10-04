// How many cells a cloud atlas holds to a row, and how many rows: the least square that holds every sprite
export const getCloudAtlasColumns = (spriteCount: number): number => Math.ceil(Math.sqrt(spriteCount));
