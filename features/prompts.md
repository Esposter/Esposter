- we need to fix blocking of the user, it might not make sense to delete friend? maybe just friend request, think about the most common sense logic here
- double check the tests for the routes, we may need to refactor them out as well to be aligned consistently with the route files
- we should also refactor with the relation contants, so we don't do things like "with { blocked: true }" etc and should be from a constant, we do this for other files already you can reference
- // router file re-exports for backward compat:
  export type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
  this is wrong, never do this, remove this from skills md, we should only ever use export const ... once in the proper file
- never add store prefix unless creating from the operation data, we only did it because we needed both operation function for messages, a niche case, note this down in skills md
- can we also fix up the storeAddFriendRequest etc, are we able to utilise the createOperationData etc, note this down in skills md we should try to use this as much as possible
