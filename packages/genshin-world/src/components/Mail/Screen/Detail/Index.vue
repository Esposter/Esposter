<script setup lang="ts">
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { MailEntry } from "#src/models/mail/MailEntry";
import type { MailSave } from "#src/models/mail/MailSave";
import type { GameText } from "genshin-text";

import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";
import { toItemDefinition } from "#src/services/inventory/toItemDefinition";
import { checkIsGiftBoxed } from "#src/services/mail/checkIsGiftBoxed";
import { GameButton, GameButtonKind, ItemTile, OrnamentDivider } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The held mails that are the Traveler's birthday mails, which the Gift Mail Box keeps once claimed
  birthdayMailIds: ReadonlySet<number>;
  // The selected mail with its row, which its title, sender, date, text and items are read from
  entry: MailEntry;
  // The game's words in the reader's language
  gameText: GameText;
  // The materials' rows by their item id, which an item's name and rarity are read from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The name texts of the items, in the reader's language, by their text id
  names: Readonly<Record<string, string>>;
  // The mails' words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const isConfirmingDeleteGift = defineModel<boolean>("isConfirmingDeleteGift", { default: false });
const { birthdayMailIds, entry, gameText, materialDataMap, names, textMap } = defineProps<Props>();
const emit = defineEmits<{ claim: [mail: MailSave]; deleteGift: [mail: MailSave]; pin: [mail: MailSave] }>();
// The date line's words either side of the date, since the game's line holds the date as {0} and the date is a NuxtTime
const dateLine = computed(() => gameText[GameTextKey.MailDetailDate].split("{0}"));
// A currency's name is the game's, and an item's its material row's, read in the reader's language
const getItemName = (itemId: number): string => {
  const currency = getWalletCurrency(itemId);
  if (currency !== undefined) return gameText[CurrencyGameTextKeyMap[currency]];
  const materialData = materialDataMap.get(itemId);
  return materialData ? toItemDefinition(materialData, names).name : String(itemId);
};
// The tile of an item takes its rarity from its material row, and a currency, which has none, draws the lowest tile
const getItemRarity = (itemId: number): number => materialDataMap.get(itemId)?.rarity ?? 0;
// The item tiles of the mail, each with its count, rarity and count label, made once per selection
const itemTiles = computed(() =>
  entry.row.items.map(({ itemId, quantity }) => ({
    count: quantity,
    id: itemId,
    label: fillGameTextValues(gameText[GameTextKey.ItemCount], getItemName(itemId), quantity),
    rarity: getItemRarity(itemId),
  })),
);
</script>

<template>
  <div class="detail" role="tabpanel" :aria-label="textMap[entry.row.titleTextId]">
    <p class="detail-title">{{ textMap[entry.row.titleTextId] }}</p>
    <OrnamentDivider class="divider" />
    <p class="sender">
      {{ fillGameTextValues(gameText[GameTextKey.MailSender], textMap[entry.row.senderTextId] ?? "") }}
    </p>
    <p class="date">
      {{ dateLine[0]
      }}<NuxtTime
        :datetime="entry.mail.deliveredAt"
        year="numeric"
        month="2-digit"
        day="2-digit"
        hour="2-digit"
        minute="2-digit"
        hour-cycle="h23"
      />{{ dateLine[1] }}
    </p>
    <p class="body">{{ textMap[entry.row.contentTextId] }}</p>
    <div v-if="entry.row.items.length > 0" class="items">
      <ItemTile
        v-for="tile of itemTiles"
        :key="tile.id"
        class="item"
        count-size="30cqh"
        :count="tile.count"
        :rarity="tile.rarity"
        role="img"
        :aria-label="tile.label"
      />
    </div>
    <GameButton
      class="pin"
      :aria-label="gameText[entry.mail.isPinned ? GameTextKey.MailCancelStar : GameTextKey.MailStar]"
      :kind="GameButtonKind.Disc"
      tip=""
      @click="emit('pin', entry.mail)"
    />
    <p v-if="entry.mail.isClaimed && entry.row.items.length > 0" class="claimed">
      {{ gameText[GameTextKey.MailClaimed] }}
    </p>
    <GameButton
      v-else-if="entry.row.items.length > 0"
      class="claim pill-disc"
      :kind="GameButtonKind.Pill"
      tip=""
      @click="emit('claim', entry.mail)"
    >
      {{ gameText[GameTextKey.MailClaim] }}
    </GameButton>
    <GameButton
      v-if="checkIsGiftBoxed(entry.mail, entry.row, birthdayMailIds) && !isConfirmingDeleteGift"
      class="delete-gift"
      :kind="GameButtonKind.Pill"
      tip=""
      @click="isConfirmingDeleteGift = true"
    >
      {{ gameText[GameTextKey.MailDelete] }}
    </GameButton>
    <section
      v-if="isConfirmingDeleteGift"
      class="confirm-gift"
      role="dialog"
      :aria-label="gameText[GameTextKey.MailGiftDeleteWarningTitle]"
    >
      <p class="confirm-title">{{ gameText[GameTextKey.MailGiftDeleteWarningTitle] }}</p>
      <p class="confirm-text">{{ gameText[GameTextKey.MailGiftDeleteWarning] }}</p>
      <GameButton class="cancel" :kind="GameButtonKind.Pill" tip="" @click="isConfirmingDeleteGift = false">
        {{ gameText[GameTextKey.Cancel] }}
      </GameButton>
      <GameButton
        class="confirm-button"
        :kind="GameButtonKind.Pill"
        tip=""
        @click="
          isConfirmingDeleteGift = false;
          emit('deleteGift', entry.mail);
        "
      >
        {{ gameText[GameTextKey.MailDelete] }}
      </GameButton>
    </section>
  </div>
</template>

<style scoped src="../../../../styles/mailScreen.css"></style>
<style scoped>
/* The selected mail on the right: its title, a hairline with its diamonds, its sender and date, its text, its items */
.detail {
  position: absolute;
  top: calc(var(--unit) * 112);
  left: calc(var(--unit) * 915);
  width: calc(var(--unit) * 724);
  height: calc(var(--unit) * 900);
}

.detail-title {
  margin: 0;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
  line-height: calc(var(--unit) * 32);
}

.divider {
  position: absolute;
  top: calc(var(--unit) * 32);
  left: calc(var(--unit) * -16);
  width: calc(var(--unit) * 755);
}

.sender,
.date,
.body {
  position: absolute;
  left: 0;
  margin: 0;
}

.sender,
.date {
  font-size: calc(var(--unit) * 19);
  line-height: calc(var(--unit) * 24);
}

.sender {
  top: calc(var(--unit) * 58);
}

.date {
  top: calc(var(--unit) * 91);
  color: rgb(220 220 220 / 0.75);
}

.body {
  top: calc(var(--unit) * 143);
  width: calc(var(--unit) * 724);
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 29);
  white-space: pre-line;
}

.items {
  position: absolute;
  top: calc(var(--unit) * 770);
  left: calc(var(--unit) * 2);
  display: flex;
  gap: calc(var(--unit) * 10);
}

.item {
  width: calc(var(--unit) * 84);
  height: calc(var(--unit) * 84);
}

.claimed {
  margin: 0;
  font-size: calc(var(--unit) * 20);
}

/* Inside the detail, which starts at 112 and 915, so the bottom row sits 884 down and 510 across it */
.mail-screen .claim {
  top: calc(var(--unit) * 884);
  left: calc(var(--unit) * 510);
  width: calc(var(--unit) * 216);
  padding-left: calc(var(--unit) * 85);
}

/* The star's cream disc, which the game draws at rest behind the star, the star itself bare */
.mail-screen .pin {
  position: absolute;
  top: calc(var(--unit) * 884);
  left: calc(var(--unit) * 437);
  width: calc(var(--unit) * 44);
  height: calc(var(--unit) * 44);
  border-radius: 50%;
  background-color: #f4edd5;
}

.confirm-gift {
  margin-top: calc(var(--unit) * 24);
}

.confirm-title {
  margin: 0 0 calc(var(--unit) * 12);
  font-size: calc(var(--unit) * 30);
}
</style>
