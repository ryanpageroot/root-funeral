# Root Funeral - AI Agent Instructions

## CRITICAL: Read This First

This is your **quick reference**. For detailed guides, see the `docs/` folder.

---

## Getting Started

1. Click **Run** to start the embed preview server
2. Use `npx @rootplatform/cli <command>` for CLI operations

---

## CLI Commands (Quick Reference)

| Command | Description |
|---------|-------------|
| `npx @rootplatform/cli push -f` | Push changes to draft (**ALWAYS use -f**) |
| `npx @rootplatform/cli test` | Run unit tests |
| `npx @rootplatform/cli publish` | Publish draft to live |
| `node preview/server.js` | Start embed preview |

---

## Key Rules (MUST FOLLOW)

1. **No import/export statements** - All functions are available globally
2. **Always update .root-config.json** - When adding alteration hooks, scheduled functions, or fulfillment types
3. **Ask before pushing** - ALWAYS confirm with user before running push commands
4. **Always use -f flag** - Use `npx @rootplatform/cli push -f` to force overwrite
5. **Validate all inputs** - Use Joi validation schemas
6. **Check docs/ folder** - For detailed schema and code guides

---

## IMPORTANT: Ask Before Pushing

**After making changes, ALWAYS ask the user before running push commands.**

Example:
> "I've updated the configuration. Would you like me to push these changes? I'll run `npx @rootplatform/cli push -f`."

---

## Project Structure

| Folder/File | Purpose |
|-------------|---------|
| `code/` | Product module JavaScript (NO import/export) |
| `workflows/` | JSON schemas (quote, application, claims) |
| `workflows/alteration-hooks/` | Alteration hook schemas |
| `documents/` | HTML templates for policy documents |
| `.root-config.json` | Product module configuration |
| `docs/` | **Detailed reference guides** |

---

## After Pushing Changes

### For Embed Changes → Open Embed Preview:
```
http://localhost:4201/root_funeral?api_key=sandbox_NjA5YjUwYjEtYzlmNi00OGI5LWI1ZTQtZDVlYTU1NjZjM2MzLnRGNDJ0dVhYLW5TaGF3dmdFOXRTc0h3Y1NrZWZibFp5&draft_definition=true
```

### For All Other Changes → Open Platform Dashboard:
```
https://d0042a4197aa.ngrok-free.app/orgs/00000000-0000-0000-0000-000000000001/insurance/policies?view=all-policies
```

---

## Detailed Documentation (docs/ folder)

| File | When to Use |
|------|-------------|
| `docs/configuration-guide.md` | Updating .root-config.json |
| `docs/product-module-code.md` | Writing hooks and code |
| `docs/quote-schema.md` | Building quote schemas |
| `docs/application-schema.md` | Building application schemas |
| `docs/claim-blocks.md` | Configuring claim workflows |
| `docs/workbench-cli.md` | CLI command reference |
| `docs/embed-config.md` | Configuring embed styles |

**When working on a specific task, read the relevant doc file for complete reference.**
