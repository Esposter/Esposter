import { router } from "@/server/trpc";
import { clickerRouter } from "@/server/trpc/routers/clicker";
import { emojiRouter } from "@/server/trpc/routers/emoji";
import { likeRouter } from "@/server/trpc/routers/like";
import { messageRouter } from "@/server/trpc/routers/message";
import { postRouter } from "@/server/trpc/routers/post";
import { roomRouter } from "@/server/trpc/routers/room";
import { userRouter } from "@/server/trpc/routers/user";

export const appRouter = router({
  clicker: clickerRouter,
  emoji: emojiRouter,
  like: likeRouter,
  message: messageRouter,
  post: postRouter,
  room: roomRouter,
  user: userRouter,
  // @NOTE: We cannot use azure blob storage with azure data tables together yet
  // https://github.com/Azure/azure-sdk-for-js/issues/21314
  // chatbot: chatbotRouter,
});

export type AppRouter = typeof appRouter;
