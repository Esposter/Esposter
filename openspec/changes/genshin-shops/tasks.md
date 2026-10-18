## 1. Grocery ingredients into the bag

- [x] 1.1 Publish the grocery's eight ingredients into the item definitions with their names. Verify: `pnpm -C scripts genshin:assets items` republishes the materials record, and `pnpm -C scripts genshin:text names` adds the ingredients' names to the name chunks, with each of the grocery's eight ingredients listed in the output.
- [x] 1.2 Add a grocery ingredient to the bag on purchase and refuse a purchase the bag cannot hold whole. Verify: buyShopGood.test.ts, named after the scenarios 'Buying a grocery ingredient into an empty bag adds it to the bag' and 'A purchase the bag cannot hold whole is refused', written first and seen failing.

## 2. Restocks and sale dates

- [x] 2.1 Restore each good's limit on its own refresh, and never for a good with no refresh. Verify: tests named after 'A daily good's limit returns at the daily refresh' and 'A good with no refresh stays bought'.
- [x] 2.2 Offer a good only within its sale dates. Verify: a test named after the scenario 'A good is not offered outside its sale dates'.

## 3. Paimon's Bargains

- [x] 3.1 Offer the monthly characters and bi-monthly weapons, refusing a character with full constellations. Verify: tests named after 'Two characters are offered each month' and 'A character with full constellations cannot be bought'. The screen waits on the bag holding the items' definitions.
- [ ] 3.2 Build the Shop screen from a public clip: its goods grid by tab, a good's detail with its price, limit and refresh, the count picker and the Buy button, emitting buy with the good and count. Verify: a test named after 'buying a good from the screen spends its price and gives the good'.

## 4. Souvenir Shops, city shops and vendors

- [ ] 4.1 Trade Sigils at each region's Souvenir Shop, closed until its offering is at its last level. Verify: tests named after 'Sigils are traded for materials, blueprints and Mora' and 'A Souvenir Shop stays closed until its offering is at its last level'.
- [x] 4.2 Apply the reputation discount to a city shop's Mora price. Verify: a test named after 'A discounted Mora price is rounded down to a multiple of five'.
- [ ] 4.3 Open a city vendor's shop from their talk as each region is built. Verify: a test named after 'Talking to a vendor opens their shop'.
- [ ] 4.4 Open the Fishing Associations' shops once fishing lands. Verify: the test named 'Talking to a vendor opens their shop', extended to the Fishing Associations' shops.
