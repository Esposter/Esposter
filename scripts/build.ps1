Invoke-Expression "pnpm lerna run build --ignore @esposter/app"
Invoke-Expression "pnpm run docs"
Invoke-Expression "pnpm lerna run build --scope=@esposter/app"