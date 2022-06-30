import { createRouter } from "@/server/trpc/createRouter";
import { roomRouter } from "@/server/trpc/room";
import { userRouter } from "@/server/trpc/user";

export const router = createRouter().merge("user.", userRouter).merge("room.", roomRouter);
