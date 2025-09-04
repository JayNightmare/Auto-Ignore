# Auto .gitignore

VS Code extension to automatically detect your project stack, propose and update a tailored `.gitignore`, and warn about tracked secrets.

## Features
- Detects Node/TS, React Native/Expo, Python, Java/Kotlin, Android/iOS, Docker, JetBrains/OS junk, and common test tooling
- Proposes a `.gitignore` with a diff preview before writing
- Keeps `.gitignore` updated as new tools/configs appear
- Warns about tracked secrets and offers fixes
- Monorepo support (root and package-level ignores)
- No telemetry, respects workspace trust

## Commands
- `Auto Gitignore: Generate` — scan, propose, diff, write
- `Auto Gitignore: Update for New Tools` — re-scan, suggest additions
- `Auto Gitignore: Scan for Secrets` — list tracked suspicious files, offer fixes

## Settings
- `autoGitignore.watchNewTools`: Watch for new tools/configs (default: true)
- `autoGitignore.manageVscodeFolder`: How to handle `.vscode/` (default: keep-important)
- `autoGitignore.secretScanOnSave`: Scan for secrets on save (default: warn)
- `autoGitignore.sortSections`: Sort sections in `.gitignore` (default: true)
- `autoGitignore.monorepoMode`: Monorepo handling (default: auto)

## How it works
- Scans workspace files/deps to detect stack
- Merges relevant ignore templates, de-dupes, sorts, and groups under managed markers
- Shows a diff preview; user can accept all or toggle sections
- Watches for new tools/configs and suggests updates
- Flags tracked secrets and offers to ignore/untrack

## Limitations
- Heuristic-based detection; may miss edge cases
- Only manages blocks it creates; preserves user content
- No network calls or telemetry

## Privacy
- Never reads outside workspace
- No telemetry

## License
MIT
