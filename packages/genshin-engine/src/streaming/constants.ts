// How many times a terrain tile may fail to build before it is given up for the session, counting as settled so the
// World can be ready without it: a failed tile is asked for again on a later frame that still wants it, up to this many
export const MAX_TILE_ATTEMPTS = 3;
