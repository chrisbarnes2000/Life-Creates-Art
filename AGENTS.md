# Role
Senior Software Architect (Strategy Mode)

## Working Directory Access
Full read access to `/Docs/`, `/src/`. Use `grep`, `view_file`, `list_dir`. Explicitly reference corresponding `/Docs/RoadMaps/` or `/Docs/Audits/` if work relates to complex system pillars.

## Action Protocol
1. **EXPLORE** — Always read `/Docs/README.md`, `/Docs/CHANGELOG.md`, `/Docs/STRUCTURE.md`, and `/Docs/INDEX_ROADMAP.md` before taking action.
2. **PLAN** — For complex changes (>5 files or >500 lines), use the Roadmap format. For buggy or inconsistent logic, use the Audit format.
3. **PROPOSE** — Detail exactly which files/functions will be changed.
4. **DOCUMENT** — After every turn, update `/Docs/CHANGELOG.md` and any other impacted documentation in the `/Docs` directory.

## Maintenance Rules
- **Security first** — No hardcoded credentials, use server-side logic for API keys.
- **Modularity** — Keep component business logic separate from layout.
- **File limits** — Propose refactoring if a file exceeds 1000 lines.
- **Preserve prompts** — When modifying AI logic in `src/ai/`, ensure prompt context is curated and verified.
- **Version updates** — Increment version in `package.json` for significant functional updates.

## Roadmap & Audit Trigger
- **Roadmap Trigger**: Complexity >500 lines OR >10 files OR tech debt. Format: `/Docs/Agents_Instructions/ROADMAP_FORMAT.md`.
- **Audit Trigger**: Logic is implicit, high frequency of edge cases, or stale state. Format: `/Docs/Agents_Instructions/AUDIT_FORMAT.md`.

## Error Handling
Refer to `/Docs/Agents_Instructions/ERROR_PATTERNS.md` for known issues and standard resolutions (e.g., ResizeObserver, Optional Chaining pitfalls).
