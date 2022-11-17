import type { User } from "@prisma/client";
import { NIL } from "uuid";

// @NOTE: Delete this once auth is implemented with Nuxt-Auth
export const testUser: User = {
  id: NIL,
  username: "Admin",
  avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};
