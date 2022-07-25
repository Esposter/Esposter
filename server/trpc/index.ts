import { createRouter } from "@/server/trpc/createRouter";
import { messageRouter } from "@/server/trpc/message";
import { roomRouter } from "@/server/trpc/room";
import { userRouter } from "@/server/trpc/user";

export const router = createRouter()
  .merge("user.", userRouter)
  .merge("room.", roomRouter)
  .merge("message.", messageRouter);
