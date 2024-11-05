rm -rf pnpm-lock.yaml
find . -name "node_modules" -type d -exec rm -rf {} +
pnpm i
