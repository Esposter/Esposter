import { z } from "zod";

export enum State {
  Start = "Start",
  Load = "Load",
  Battle = "Battle",
  ShopPicker = "ShopPicker",
  Shop = "Shop",
}

export const stateSchema = z.nativeEnum(State) satisfies z.ZodType<State>;
