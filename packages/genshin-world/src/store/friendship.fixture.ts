import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";

import { useWorldFriendshipStore } from "#src/store/friendship";

// The friendship store holding exactly these levels, none while they are unread, for a suite that tests a feature
// Reading them. Called after the session is started, since that makes the Pinia it holds them in
export const startTestWorldFriendship = (friendshipLevels?: FriendshipLevels) => {
  const worldFriendshipStore = useWorldFriendshipStore();
  worldFriendshipStore.friendshipLevels = friendshipLevels;
  return worldFriendshipStore;
};
