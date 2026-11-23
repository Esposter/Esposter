import { Currency } from "#src/models/inventory/Currency";

// The items a shop trades in as currencies, by their ids in the game's tables.
// Mora is what the general goods are priced in, and Masterless Starglitter and Stardust are what the shop takes.
// The two Fates it gives are currencies too.
// Realm Currency is what the Realm Depot prices its goods in.
// The eight region Sigils are what each Souvenir Shop takes.
// The pairing of the Masterless two is settled on the shop page's decisions.
// It awaits a recording's check of their names.
export const ShopItemCurrencyMap: Partial<Record<number, Currency>> = {
  202: Currency.Mora,
  204: Currency.RealmCurrency,
  221: Currency.MasterlessStarglitter,
  222: Currency.MasterlessStardust,
  223: Currency.IntertwinedFate,
  224: Currency.AcquaintFate,
  301: Currency.PyroSigil,
  302: Currency.HydroSigil,
  303: Currency.DendroSigil,
  304: Currency.ElectroSigil,
  305: Currency.AnemoSigil,
  306: Currency.CryoSigil,
  307: Currency.GeoSigil,
  308: Currency.LunaSigil,
};
