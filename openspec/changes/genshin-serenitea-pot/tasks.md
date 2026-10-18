## 1. Realm entry

- [x] 1.1 Open the realm from the pot at Adventure Rank 28 and not below. Verify: a test named after the scenario 'The pot opens the realm at Adventure Rank 28', written first and seen failing, with 'The pot does not open the realm below Adventure Rank 28' beside it.
- [x] 1.2 Leave the realm by the gadget or a teleport, returning to where the player went in. Verify: a test named after the scenario 'The gadget leaves the realm where the player went in'.
- [x] 1.3 Enter the realm from the pot's gadget into a stand-in realm scene, provisional until the PC exports the realm layout. Verify: the browser test of `components/World/Realm/Index.browser.test.ts`, 'the realm's island draws into a canvas', run by the coordinator (not run here); the realm's interactables are tested in `computeHomeRealmInteractables.test.ts`. Built: the pot's gadget is material row 220026 (`MaterialExcelConfigData`, the widget type, named by 200477924, and absent from `ConfigWidget`), the island with Tubby and the exit pot, leaving through `leaveHomeRealm`, and the Session's world-or-realm swap. Provisional, made up: the region a placed pot returns to, the island's radius, the standing points and the spawn. The pot's GadgetRow is built from its material row with one placed in the scene and one by the player, provisional until the PC's gadget export or a recording settles them (the shops design's Decisions).
- [x] 1.4 Set the pot down at the player's feet when the gadget slot's pot is used, and refuse a second while one stands. Verify: `placeHomePot.test.ts`, named after the scenarios 'The pot is set down at the player's feet' and 'A second pot is refused while one stands', with the Session's quick-use hook run by the coordinator's browser check (not run here).

## 2. Companions

- [x] 2.1 Invite and dismiss companions within the Trust Rank's count. Verify: inviteHomeCompanion.test.ts, named after the scenarios 'A companion is invited within the Trust Rank's count' and 'A second companion is refused at Trust Rank one', with the Traveler and a character already living there refused.
- [ ] 2.2 Give a companion its dialogue and one-time reward for a favoured gift set, once the placement editor places the furnishing sets. Verify: a test named after the scenario 'A favoured gift set gives the companion's reward once'.

## 3. Realm Depot

- [x] 3.1 Hold Realm Currency in the wallet once its game text name is keyed. Verify: a test named after the scenario 'Realm Currency is held in the wallet'.
- [x] 3.2 Write the depot's tabs from the goods rows and buy through the shared shop purchase at each tab's refresh. Verify: tests named after 'Buying a furnishing from the depot takes Realm Currency', 'A purchase the wallet cannot cover is refused' and 'A weekly good's limit returns at its weekly refresh'.
- [x] 3.3 Accrue Realm Currency and Realm Bounty per real hour up to the store's limit, both settled on the one clock they share. Verify: tests named after the scenarios 'A store fills over real time', 'A store stops at its limit' and 'A clock read earlier than the last claim produces nothing' in claimHomeCurrency.test.ts, and 'a bounty claim keeps the realm currency earned since the last claim' in claimHomeBounty.test.ts.
- [x] 3.4 Open the Realm Depot from Tubby in the realm, at the depot's shop type through the shop screen. Verify: the browser test `components/Shop/Screen/Index.browser.test.ts`, named after the scenario 'Tubby's depot opens on its first tab', written and run by the coordinator (not run here). Built: Tubby is the NPC row 13276 (`HOME_TUBBY_NPC_ID`), keyed to shop 1048 in `VendorShopTypeMap`, and the talk key on him opens the shop screen in the Session; the depot's goods are read as the shop's goods (`readShopGoodMap.test.ts`) and grouped by their tab (`computeShopTabs.test.ts`). The browser test opens the screen with the depot's goods; the Session's Tubby wiring is left to the coordinator's browser check.

## 4. Placement

- [x] 4.1 Refuse a placement that takes an area past its load. Verify: a test named after the scenario 'A placement past the area's load is refused'.
- [x] 4.2 Keep each placement with the player's progress. Verify: a test named after the scenario 'Placements are kept across a return to the realm'.
- [ ] 4.3 Place the held furnishings in the realm through `placeHomeFurnishing` and `placeHomeFurnishingSet` from the placement editor. Verify: the browser tests of `components/World/Realm/PlacementEditor/Index.browser.test.ts`, 'a furnishing that fits is placed where it was picked' and 'a furnishing past the area's load is refused', run by the coordinator (not run here). Written: the editor, its meter and its notice over the placement's own `getHomeAreaPlacements` and `getHomeFurnishingLimit`, its word `HomeDeploy` and its notices `RetHomeFurnitureArrangeLimit` and `RetHomeFurnitureExceedLimit`; the keys' English text waits on `genshin:text write`. Still open: the editor mounted in the realm scene and the ground pick from it (1.3), and the parity pass against the game's placement mode.

## 5. Gardens and companions' earnings

- [ ] 5.1 Grow a garden's seeds and hold a pond's fish over real time. Verify: a test named after the scenario 'A garden's seeds grow over real time'.
- [x] 5.2 Accrue Companionship EXP to each companion living in the realm. Verify: a test named after the scenario 'A companion living in the realm earns Companionship EXP'.

## 6. Save

- [ ] 6.1 Backfill each save written before `homePlacements` with an empty list, on dev and then on prod. Verify: none; the backfills run reports nothing to change on each store, and its script is not committed. Blocked: the main session runs it once this schema reaches dev (design Decisions).
