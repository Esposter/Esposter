import { z } from "zod";

export enum State {
  Start = "Start",
  Battle = "Battle",
  ShopPicker = "ShopPicker",
  Shop = "Shop",
}

export const stateSchema = z.nativeEnum(State) satisfies z.ZodType<State>;
