export enum CardType {
  Carousel = "Carousel",
  Marquee = "Marquee",
}
// The route-query guard's membership check
export const CardTypes: ReadonlySet<CardType> = new Set(Object.values(CardType));
