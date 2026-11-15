// The game's two builds, whose openings differ: the global one, published by HoYoverse, and mainland China's, which
// Opens on its title with no publisher's logo and carries its publishing licence under it
export const GameClient = { Global: "Global", Mainland: "Mainland" } as const;
export type GameClient = (typeof GameClient)[keyof typeof GameClient];
