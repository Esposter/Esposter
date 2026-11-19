import type { ImaginariumCompanionPool } from "#src/models/imaginarium/ImaginariumCompanionPool";

// A Companion event: the pool its offers are drawn from and the Fantasia Flowers it costs, priced where the event is
export interface ImaginariumCompanionEvent {
  flowerPrice: number;
  pool: ImaginariumCompanionPool;
}
