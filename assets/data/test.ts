import type { User } from "@prisma/client";
import { NIL } from "uuid";

// @NOTE: Delete this once auth is implemented with Nuxt-Auth
export const testUser: User = {
  id: NIL,
  name: "Admin",
  email: "testUser@gmail.com",
  emailVerified: null,
  image: "https://cdn.vuetifyjs.com/images/lists/1.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};
