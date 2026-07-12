import { AlchemyLabUpgradeMap } from "#shared/assets/clicker/data/upgrades/AlchemyLabUpgradeMap";
import { AntimatterCondenserUpgradeMap } from "#shared/assets/clicker/data/upgrades/AntimatterCondenserUpgradeMap";
import { BankUpgradeMap } from "#shared/assets/clicker/data/upgrades/BankUpgradeMap";
import { ChancemakerUpgradeMap } from "#shared/assets/clicker/data/upgrades/ChancemakerUpgradeMap";
import { CortexBakerUpgradeMap } from "#shared/assets/clicker/data/upgrades/CortexBakerUpgradeMap";
import { CursorUpgradeMap } from "#shared/assets/clicker/data/upgrades/CursorUpgradeMap";
import { FactoryUpgradeMap } from "#shared/assets/clicker/data/upgrades/FactoryUpgradeMap";
import { FarmUpgradeMap } from "#shared/assets/clicker/data/upgrades/FarmUpgradeMap";
import { FractalEngineUpgradeMap } from "#shared/assets/clicker/data/upgrades/FractalEngineUpgradeMap";
import { GrandmaUpgradeMap } from "#shared/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { IdleverseUpgradeMap } from "#shared/assets/clicker/data/upgrades/IdleverseUpgradeMap";
import { JavascriptConsoleUpgradeMap } from "#shared/assets/clicker/data/upgrades/JavascriptConsoleUpgradeMap";
import { MineUpgradeMap } from "#shared/assets/clicker/data/upgrades/MineUpgradeMap";
import { PortalUpgradeMap } from "#shared/assets/clicker/data/upgrades/PortalUpgradeMap";
import { PrismUpgradeMap } from "#shared/assets/clicker/data/upgrades/PrismUpgradeMap";
import { ShipmentUpgradeMap } from "#shared/assets/clicker/data/upgrades/ShipmentUpgradeMap";
import { TempleUpgradeMap } from "#shared/assets/clicker/data/upgrades/TempleUpgradeMap";
import { TimeMachineUpgradeMap } from "#shared/assets/clicker/data/upgrades/TimeMachineUpgradeMap";
import { WizardTowerUpgradeMap } from "#shared/assets/clicker/data/upgrades/WizardTowerUpgradeMap";
import { mergeObjectsStrict } from "@esposter/shared";

export const UpgradeMap = mergeObjectsStrict(
  AlchemyLabUpgradeMap,
  AntimatterCondenserUpgradeMap,
  BankUpgradeMap,
  ChancemakerUpgradeMap,
  CortexBakerUpgradeMap,
  CursorUpgradeMap,
  FactoryUpgradeMap,
  FarmUpgradeMap,
  FractalEngineUpgradeMap,
  GrandmaUpgradeMap,
  IdleverseUpgradeMap,
  JavascriptConsoleUpgradeMap,
  MineUpgradeMap,
  PortalUpgradeMap,
  PrismUpgradeMap,
  ShipmentUpgradeMap,
  TempleUpgradeMap,
  TimeMachineUpgradeMap,
  WizardTowerUpgradeMap,
);
