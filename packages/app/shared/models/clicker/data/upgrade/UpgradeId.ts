import { AlchemyLabUpgradeId } from "#shared/models/clicker/data/upgrade/AlchemyLabUpgradeId";
import { AntimatterCondenserUpgradeId } from "#shared/models/clicker/data/upgrade/AntimatterCondenserUpgradeId";
import { BankUpgradeId } from "#shared/models/clicker/data/upgrade/BankUpgradeId";
import { ChancemakerUpgradeId } from "#shared/models/clicker/data/upgrade/ChancemakerUpgradeId";
import { CortexBakerUpgradeId } from "#shared/models/clicker/data/upgrade/CortexBakerUpgradeId";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { FactoryUpgradeId } from "#shared/models/clicker/data/upgrade/FactoryUpgradeId";
import { FarmUpgradeId } from "#shared/models/clicker/data/upgrade/FarmUpgradeId";
import { FractalEngineUpgradeId } from "#shared/models/clicker/data/upgrade/FractalEngineUpgradeId";
import { GrandmaUpgradeId } from "#shared/models/clicker/data/upgrade/GrandmaUpgradeId";
import { IdleverseUpgradeId } from "#shared/models/clicker/data/upgrade/IdleverseUpgradeId";
import { JavascriptConsoleUpgradeId } from "#shared/models/clicker/data/upgrade/JavascriptConsoleUpgradeId";
import { MineUpgradeId } from "#shared/models/clicker/data/upgrade/MineUpgradeId";
import { PortalUpgradeId } from "#shared/models/clicker/data/upgrade/PortalUpgradeId";
import { PrismUpgradeId } from "#shared/models/clicker/data/upgrade/PrismUpgradeId";
import { ShipmentUpgradeId } from "#shared/models/clicker/data/upgrade/ShipmentUpgradeId";
import { TempleUpgradeId } from "#shared/models/clicker/data/upgrade/TempleUpgradeId";
import { TimeMachineUpgradeId } from "#shared/models/clicker/data/upgrade/TimeMachineUpgradeId";
import { WizardTowerUpgradeId } from "#shared/models/clicker/data/upgrade/WizardTowerUpgradeId";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod";

export const UpgradeId = mergeObjectsStrict(
  AlchemyLabUpgradeId,
  AntimatterCondenserUpgradeId,
  BankUpgradeId,
  ChancemakerUpgradeId,
  CortexBakerUpgradeId,
  CursorUpgradeId,
  FactoryUpgradeId,
  FarmUpgradeId,
  FractalEngineUpgradeId,
  GrandmaUpgradeId,
  IdleverseUpgradeId,
  JavascriptConsoleUpgradeId,
  MineUpgradeId,
  PortalUpgradeId,
  PrismUpgradeId,
  ShipmentUpgradeId,
  TempleUpgradeId,
  TimeMachineUpgradeId,
  WizardTowerUpgradeId,
);
export type UpgradeId =
  | AlchemyLabUpgradeId
  | AntimatterCondenserUpgradeId
  | BankUpgradeId
  | ChancemakerUpgradeId
  | CortexBakerUpgradeId
  | CursorUpgradeId
  | FactoryUpgradeId
  | FarmUpgradeId
  | FractalEngineUpgradeId
  | GrandmaUpgradeId
  | IdleverseUpgradeId
  | JavascriptConsoleUpgradeId
  | MineUpgradeId
  | PortalUpgradeId
  | PrismUpgradeId
  | ShipmentUpgradeId
  | TempleUpgradeId
  | TimeMachineUpgradeId
  | WizardTowerUpgradeId;

export const upgradeIdSchema = z.enum(UpgradeId) satisfies z.ZodType<UpgradeId>;
