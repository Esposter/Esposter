import { InviteEntity, InviteEntityPropertyNames } from "#shared/models/db/room/InviteEntity";
import { dayjs } from "#shared/services/dayjs";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { AZURE_DEFAULT_PARTITION_KEY } from "@@/server/services/azure/table/constants";
import { deleteEntity } from "@@/server/services/azure/table/deleteEntity";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";

export const readInviteCode = async (roomId: string) => {
  const inviteClient = await useTableClient(AzureTable.Invites);
  // We only allow one invite code per room so let's find and return the code to the user if it exists
  const invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
    filter: `PartitionKey eq '${AZURE_DEFAULT_PARTITION_KEY}' and ${InviteEntityPropertyNames.roomId} eq '${roomId}'`,
  });
  const invite = invites.find(Boolean);
  if (!invite) return null;
  else if (dayjs(invite.createdAt).add(24, "hours").isAfter(new Date())) return invite.rowKey;
  else {
    await deleteEntity(inviteClient, AZURE_DEFAULT_PARTITION_KEY, invite.rowKey);
    return null;
  }
};
