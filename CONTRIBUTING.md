# Contributing

Thanks for taking the time to contribute! This document describes how to work on `protoc-gen-ts-contract` as an open source package.

## Getting started

- Use Node.js >= 22 and pnpm (see `packageManager` in `package.json`).
- Install dependencies with `pnpm install --frozen-lockfile`.
- Ensure the Buf CLI is available (`pnpm exec buf --version` or install `@bufbuild/buf`).

Common commands (run from the repo root):

```bash
pnpm -C packages/ts-contract-plugin build   # compile to dist/ with CLI shim
pnpm lint                                   # type-check all packages
pnpm test                                   # build + vitest (includes buf e2e)
pnpm check                                  # lint + test via turbo
```

Keep generated outputs (`dist/**`, `example/gen/**`) out of version control; rebuild locally as needed.

## Development guidelines

- Follow the repository coding style: strict TypeScript, NodeNext/ESM, `exactOptionalPropertyTypes`, and deterministic generation.
- Write meaningful tests for any new or changed behavior. Prefer real fixtures and avoid mock-only coverage.
- Update documentation alongside code changes (README, docs/ design notes, example instructions).
- Fail fast on option parsing and surface actionable errors to users.
- Leave no TODOs or placeholder logic; keep changes small and focused.

## Pull requests

1. Create a branch and keep commits scoped to a single concern.
2. Run `pnpm check` before opening a PR; include failing output if you cannot resolve it.
3. Update `packages/ts-contract-plugin/CHANGELOG.md` when behavior or packaging changes.
4. Ensure new CLI behavior is reflected in `package.json` and README examples.
5. Open an issue first for large features or breaking changes to confirm direction.

## Releases

- Bump the version in `packages/ts-contract-plugin/package.json`.
- Record changes in `packages/ts-contract-plugin/CHANGELOG.md`.
- Tag the release and publish the package to npm (CI automation recommended).
- Create a GitHub Release with links to the changelog and relevant issues.

## Reporting issues

Please use the GitHub issue templates. Include reproduction steps, expected vs. actual behavior, environment details (OS, Node version, Buf version), and any proto snippets that help diagnose the problem.
