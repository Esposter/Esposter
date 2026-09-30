import { LoginTowerKind } from "#src/models/login/LoginTowerKind";

// Each kind's shaft width, which the field's towers vary about and the near towers' depths are read from
export const LoginTowerDiameterMap: Record<LoginTowerKind, number> = {
  [LoginTowerKind.Crowned]: 2.2,
  [LoginTowerKind.Ringed]: 3,
  [LoginTowerKind.Slender]: 0.5,
};
