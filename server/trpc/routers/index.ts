import { router } from "@/server/trpc";
import { messageRouter } from "@/server/trpc/routers/message";
import { postRouter } from "@/server/trpc/routers/post";
import { roomRouter } from "@/server/trpc/routers/room";
import { userRouter } from "@/server/trpc/routers/user";

export const appRouter = router({
  user: userRouter,
  room: roomRouter,
  post: postRouter,
  message: messageRouter,
  // @NOTE: We cannot use azure blob storage with azure data tables together yet
  // https://github.com/Azure/azure-sdk-for-js/issues/21314
  // chatbot: chatbotRouter,
});

export type AppRouter = typeof appRouter;
