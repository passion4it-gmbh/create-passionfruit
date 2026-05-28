# create-passionfruit

Scaffold a [passionfruit](https://github.com/passion4it-gmbh/passionfruit) website — bilingual marketing sites powered by Claude Code.

## Usage

```bash
pnpm create passionfruit my-site
```

or with npm / yarn:

```bash
npm create passionfruit@latest my-site
yarn create passionfruit my-site
```

Then:

```bash
cd my-site
claude          # open Claude Code
/onboard        # personalize for your business
```

## What it does

1. Downloads the latest passionfruit template release
2. Extracts it into your target directory
3. Initializes git
4. Runs `pnpm install`
5. Creates the initial commit

## Updating an existing site

`create-passionfruit` is a one-shot scaffold — your project is yours from the moment it's created. There's no upstream merge link. To pull in improvements from newer passionfruit releases, you have two options:

### Option 1: Ask Claude (recommended)

Open your project in Claude Code and ask for what you want:

```
Check passion4it-gmbh/passionfruit for new features. Pull in the
newsletter signup component from the latest release and adapt it to
our brand colors.
```

Claude can fetch specific files from the latest [passionfruit release](https://github.com/passion4it-gmbh/passionfruit/releases), adapt them to your codebase, and wire them in. This is the most flexible path — you only adopt what's useful.

For a broad audit, ask:

```
Look at https://github.com/passion4it-gmbh/passionfruit/releases for
versions newer than the one this project was scaffolded from. Summarize
what changed and which updates make sense for our site.
```

### Option 2: Manual cherry-pick (if you want full control)

Add upstream as a git remote and merge selectively:

```bash
git remote add upstream https://github.com/passion4it-gmbh/passionfruit.git
git fetch upstream main
# Inspect what's new:
git log HEAD..upstream/main --oneline
# Cherry-pick a specific commit:
git cherry-pick <sha>
```

Expect conflicts on `i18n/*.json`, `src/lib/page-registry.ts`, and `src/content/`. Those are your business content — keep your version.

## License

MIT
