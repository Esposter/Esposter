import type { PublicUser } from "#src/models/user/PublicUser";

// The columns a relational read takes for another user's row
export const PublicUserColumns = {
  biography: true,
  createdAt: true,
  deletedAt: true,
  id: true,
  image: true,
  name: true,
  updatedAt: true,
} as const satisfies Record<keyof PublicUser, true>;
