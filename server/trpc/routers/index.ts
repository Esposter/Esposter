import { router } from "@/server/trpc";
import { clickerRouter } from "@/server/trpc/routers/clicker";
import { likeRouter } from "@/server/trpc/routers/like";
import { messageRouter } from "@/server/trpc/routers/message";
import { postRouter } from "@/server/trpc/routers/post";
import { roomRouter } from "@/server/trpc/routers/room";

export const appRouter = router({
  clicker: clickerRouter,
  like: likeRouter,
  message: messageRouter,
  post: postRouter,
  room: roomRouter,
  // @NOTE: We cannot use azure blob storage with azure data tables together yet
  // https://github.com/Azure/azure-sdk-for-js/issues/21314
  // chatbot: chatbotRouter,
});

export type AppRouter = typeof appRouter;
