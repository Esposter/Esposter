export const CardType = { Carousel: "Carousel", Marquee: "Marquee" } as const;
export type CardType = (typeof CardType)[keyof typeof CardType];
// The route-query guard's membership check
export const CardTypes: ReadonlySet<CardType> = new Set(Object.values(CardType));
