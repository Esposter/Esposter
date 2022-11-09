import { router } from "@/server/trpc";
import { chatbotRouter } from "@/server/trpc/routers/chatbot";
import { messageRouter } from "@/server/trpc/routers/message";
import { postRouter } from "@/server/trpc/routers/post";
import { roomRouter } from "@/server/trpc/routers/room";
import { userRouter } from "@/server/trpc/routers/user";

export const appRouter = router({
  user: userRouter,
  room: roomRouter,
  post: postRouter,
  message: messageRouter,
  chatbot: chatbotRouter,
});

export type AppRouter = typeof appRouter;
