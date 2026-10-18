import { MailExpiryUnit } from "#src/models/mail/MailExpiryUnit";
import { GameTextKey } from "genshin-text";

// The line each unit of a mail's time left is shown in, its count filled into it
export const MailExpiryGameTextKeyMap: Readonly<Record<MailExpiryUnit, GameTextKey>> = {
  [MailExpiryUnit.Day]: GameTextKey.MailExpiresInDay,
  [MailExpiryUnit.Hour]: GameTextKey.MailExpiresInHour,
  [MailExpiryUnit.LessThanMinute]: GameTextKey.MailExpiresInLessThanMinute,
  [MailExpiryUnit.Minute]: GameTextKey.MailExpiresInMinute,
};
