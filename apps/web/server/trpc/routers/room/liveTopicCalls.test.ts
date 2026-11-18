import type { AuthSession } from "#server/models/auth/AuthSession";
import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createMockAuthSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { bookmarkRouter } from "#server/trpc/routers/bookmark";
import { inviteRouter } from "#server/trpc/routers/invite";
import { trpcRouter } from "#server/trpc/routers/index";
import { PageMarkType } from "#shared/models/app/PageMarkType";

const name = "name";
const updatedName = "updatedName";
const title = "title";

const createRoomCaller = (context: Context) => createCallerFactory(trpcRouter)(context).room;

// The context a call made as another person runs in: the same database, with that person's session and user
const actAs = (context: Context, { session, user }: AuthSession): Context => ({ ...context, session, user });

// A room another user owns, which the viewer bookmarks from outside it. The bookmark is taken before the viewer joins,
// So the dock lists the room unavailable until the link the owner made admits the viewer
export const createBookmarkedJoinableRoom = async (context: Context) => {
  const owner = await createMockAuthSession(context.db);
  const ownerContext = actAs(context, owner);
  const room = await createRoomCaller(ownerContext).createRoom({ name });
  const invite = await createCallerFactory(inviteRouter)(ownerContext).createInvite({
    expireAfterMinutes: 0,
    maxUses: 0,
    roomId: room.id,
  });
  const path = `/rooms/${room.id}`;
  await createCallerFactory(bookmarkRouter)(context).toggleBookmark({
    mark: { id: room.id, type: PageMarkType.Room },
    path,
    title,
  });
  return { invite, path, room, title };
};

// The room router's cases for the live topic check, with the rooms they act on set up through the context. Each query
// Reads the viewer's rooms or one room's members, and each write changes one of them
export const createRoomLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  const newRoom = await createRoomCaller(context).createRoom({ name });
  const deletedRoom = await createRoomCaller(context).createRoom({ name });
  const newInvite = await createCallerFactory(inviteRouter)(context).createInvite({
    expireAfterMinutes: 0,
    maxUses: 0,
    roomId: newRoom.id,
  });
  const stranger = await createMockAuthSession(context.db);
  const createStrangerCaller = (callContext: Context) => createRoomCaller(actAs(callContext, stranger));
  // The stranger joins before the checks, so the write that changes the room's members is their leave
  await createStrangerCaller(context).joinRoom(newInvite.id);
  const joinable = await createBookmarkedJoinableRoom(context);

  return {
    queries: [
      {
        call: (callContext) => createRoomCaller(callContext).readMemberCountsByTopRole({ roomId: newRoom.id }),
        path: "room.readMemberCountsByTopRole",
      },
      {
        call: (callContext) => createRoomCaller(callContext).readMembers({ roomId: newRoom.id }),
        path: "room.readMembers",
      },
      {
        call: (callContext) => createRoomCaller(callContext).readMembersCount({ roomId: newRoom.id }),
        path: "room.readMembersCount",
      },
      {
        call: (callContext) => createRoomCaller(callContext).readMutualRooms({ userId: stranger.user.id }),
        path: "room.readMutualRooms",
      },
      { call: (callContext) => createRoomCaller(callContext).readRoom(newRoom.id), path: "room.readRoom" },
      { call: (callContext) => createRoomCaller(callContext).readRooms(), path: "room.readRooms" },
      {
        call: (callContext) =>
          createRoomCaller(callContext).readUsersByIds({ roomId: newRoom.id, userIds: [stranger.user.id] }),
        path: "room.readUsersByIds",
      },
    ],
    writes: [
      { call: (callContext) => createRoomCaller(callContext).createRoom({ name }), path: "room.createRoom" },
      {
        call: (callContext) => createRoomCaller(callContext).updateRoom({ id: newRoom.id, name: updatedName }),
        path: "room.updateRoom",
      },
      // The viewer joins the room they bookmarked from outside it, so the join must wake their list of rooms
      { call: (callContext) => createRoomCaller(callContext).joinRoom(joinable.invite.id), path: "room.joinRoom" },
      { call: (callContext) => createStrangerCaller(callContext).leaveRoom(newRoom.id), path: "room.leaveRoom" },
      { call: (callContext) => createRoomCaller(callContext).deleteRoom(deletedRoom.id), path: "room.deleteRoom" },
    ],
  };
};
