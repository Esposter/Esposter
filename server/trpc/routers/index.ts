import type { User } from "@prisma/client";
import { NIL } from "uuid";
import type { PostWithRelations } from "@/prisma/types";
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

// @NOTE: Delete this once auth is implemented with Nuxt-Auth
export const testUser: User = {
  id: NIL,
  username: "Yah boi",
  avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

export const testPost: PostWithRelations = {
  id: NIL,
  title: "Hello!",
  description: "Lorem Ipsum",
  creator: testUser,
  creatorId: testUser.id,
  ranking: 0,
  edited: false,
  noPoints: 1,
  noComments: 1,
  depth: 0,
  parentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};
