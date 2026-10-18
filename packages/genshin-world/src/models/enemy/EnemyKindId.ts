// The kinds the world places, each by the game's own monster id. A kind is added with the first camp that places it,
// With its traits, and its row is then read from the game's data into the kinds' table; a boss is added ahead of its
// Camp, with its blossom, so its claim has a kind to read
export enum EnemyKindId {
  AnemoHypostasis = 20040201,
  HilichurlFighter = 21010101,
}
