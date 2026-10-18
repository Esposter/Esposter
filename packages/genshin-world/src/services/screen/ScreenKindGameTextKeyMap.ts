import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { GameTextKey } from "genshin-text";

// Each screen's title in the game's words, which its Paimon menu entry and its placeholder show
export const ScreenKindGameTextKeyMap: Readonly<Record<TitledScreenKind, GameTextKey>> = {
  [ScreenKind.Achievements]: GameTextKey.Achievements,
  [ScreenKind.AdventurerHandbook]: GameTextKey.AdventurerHandbook,
  [ScreenKind.Archive]: GameTextKey.Archive,
  [ScreenKind.BattlePass]: GameTextKey.BattlePass,
  [ScreenKind.Blessing]: GameTextKey.DomainTitle,
  [ScreenKind.Character]: GameTextKey.Character,
  [ScreenKind.CharacterArchive]: GameTextKey.CharacterArchive,
  [ScreenKind.Chat]: GameTextKey.Chat,
  [ScreenKind.CoOp]: GameTextKey.CoOp,
  [ScreenKind.Domain]: GameTextKey.DomainTitle,
  [ScreenKind.Events]: GameTextKey.Events,
  [ScreenKind.Friends]: GameTextKey.Friends,
  [ScreenKind.Inventory]: GameTextKey.Inventory,
  [ScreenKind.Mail]: GameTextKey.Mail,
  [ScreenKind.Map]: GameTextKey.Map,
  [ScreenKind.Notices]: GameTextKey.Notices,
  [ScreenKind.PaimonsBargains]: GameTextKey.PaimonsBargains,
  [ScreenKind.PartySetup]: GameTextKey.PartySetup,
  [ScreenKind.PhotoMode]: GameTextKey.TakePhoto,
  [ScreenKind.Processing]: GameTextKey.ProcessingStart,
  [ScreenKind.Quests]: GameTextKey.Quests,
  [ScreenKind.Reputation]: GameTextKey.CityReputation,
  [ScreenKind.Settings]: GameTextKey.Settings,
  [ScreenKind.Shop]: GameTextKey.Shop,
  [ScreenKind.SpiralAbyss]: GameTextKey.AbyssMoonSpire,
  [ScreenKind.Time]: GameTextKey.Time,
  [ScreenKind.TrainingGuide]: GameTextKey.TrainingGuide,
  [ScreenKind.Wish]: GameTextKey.Wish,
};
