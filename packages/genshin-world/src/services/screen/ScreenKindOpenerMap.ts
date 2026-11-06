import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ScreenKindOpener } from "#src/models/screen/ScreenKindOpener";

// The one way the player opens each screen kind, as the code opens it: a Paimon menu entry, a shortcut (an input action
// Or a wheel entry), an interaction with the world, or the world itself. A kind that both a menu entry and a shortcut
// Open takes the menu. Typed over every kind, so a new kind names its way in here
export const ScreenKindOpenerMap: Readonly<Record<ScreenKind, ScreenKindOpener>> = {
  [ScreenKind.Achievements]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.AdventurerHandbook]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.Archive]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.BattlePass]: ScreenKindOpener.PaimonMenu,
  // Opened from a statue's Worship screen, which the statue's interaction opens
  [ScreenKind.Blessing]: ScreenKindOpener.Interaction,
  [ScreenKind.Character]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.CharacterArchive]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.Chat]: ScreenKindOpener.Shortcut,
  [ScreenKind.Cooking]: ScreenKindOpener.Interaction,
  [ScreenKind.CoOp]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.Crafting]: ScreenKindOpener.Interaction,
  [ScreenKind.Dialogue]: ScreenKindOpener.Interaction,
  [ScreenKind.Domain]: ScreenKindOpener.Interaction,
  [ScreenKind.Events]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.Expedition]: ScreenKindOpener.Interaction,
  [ScreenKind.Fishing]: ScreenKindOpener.Interaction,
  [ScreenKind.Forge]: ScreenKindOpener.Interaction,
  [ScreenKind.Friends]: ScreenKindOpener.PaimonMenu,
  // The party falling outside a domain opens it, a world trigger that an interaction's opener covers
  [ScreenKind.GameOver]: ScreenKindOpener.Interaction,
  [ScreenKind.GcgDuel]: ScreenKindOpener.Interaction,
  [ScreenKind.Inventory]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.Mail]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.Map]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.Notices]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.PaimonMenu]: ScreenKindOpener.Shortcut,
  [ScreenKind.PaimonsBargains]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.PartySetup]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.PhotoMode]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.Processing]: ScreenKindOpener.Interaction,
  [ScreenKind.Quests]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.Reputation]: ScreenKindOpener.Interaction,
  [ScreenKind.Settings]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.Shop]: ScreenKindOpener.Interaction,
  [ScreenKind.SpiralAbyss]: ScreenKindOpener.Interaction,
  [ScreenKind.Time]: ScreenKindOpener.PaimonMenu,
  // No code opens it: the Paimon menu leaves it out, and the wiki's list of the menu's contents names it, so the check
  // Names it until the menu or the screen is settled (the screens design's open items)
  [ScreenKind.TrainingGuide]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.Wish]: ScreenKindOpener.PaimonMenu,
  [ScreenKind.World]: ScreenKindOpener.World,
  [ScreenKind.Worship]: ScreenKindOpener.Interaction,
};
