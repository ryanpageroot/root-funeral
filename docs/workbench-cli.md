# Workbench CLI Commands

How to use the Root Workbench CLI tool.

## Important behavior (for AI assistants)
- **ALWAYS ask the user before running `rp push` or `rp publish`** (never run automatically). After changes, ask: *“Would you like me to push these changes?”*
- **When pushing, use force**: **`rp push -f`** (recommended to overwrite the draft and avoid “definition has changed” diff errors).

---

## Commands Reference

### `rp create [api key] [product module name] [product module key]`
**Purpose:** Create a new blank starter product module on Root, enable it for the org, and auto-clone to a new local directory.

**Flags**
- `-h` / `--host` — Host to create from. Defaults to `https://api.rootplatform.com/`.

**Example**
```bash
$ rp create sandbox_GDIwZGYxg5LTgMTE4YzWkhhKZV5xdVLZENTNt "Pet Insurance" pet_insurance -h https://api.uk.rootplatform.com/
Product module 'pet_insurance' successfully created on the Root Platform
Product module 'pet_insurance' successfully cloned into './pet_insurance' directory.
$ cd pet_insurance
```

**Notes**
- Product module keys must be unique across all organisations on Root.

---

### `rp clone [api key] [product module key]`
**Purpose:** Create a new directory and clone the latest **draft** product module from Root for local editing (typically initial setup only).

**Flags**
- `-h` / `--host` — Host to clone from. Defaults to `https://api.rootplatform.com/`.

**Example**
```bash
$ rp clone sandbox_NDIwZGYxg5LTgMTE4YzWkhhKZV5xdVLZENTNt dinosure -h https://api.uk.rootplatform.com/
Product module 'dinosure' successfully cloned into './dinosure' directory.
$ cd dinosure
```

---

### `rp pull`
**Purpose:** Pull product module files/configs from Root and override local files (defaults to latest **draft**).

**Flags**
- `-f` / `--force` — Ignore diff check and force pull (**overrides all local files**).
- `-l` / `--live` — Pull the **live** version.
- `-ns` / `--no-sort` — Skip sorting JSON object keys to match local ordering; write keys as received.

**Example**
```bash
$ rp pull
No changes to pull, local version is in sync with Root
```

---

### `rp push`
**Purpose:** Push local files/configs to Root to create a new **draft** version.

**Flags**
- `-f` / `--force` — Ignore diff check and force push. **Recommended: use `rp push -f`.**
- `-ns` / `--no-sort` — Skip sorting JSON object keys to match local ordering; write keys as received.

**Example**
```bash
$ rp push
No changes to push, local version is in sync with Root
```

**Critical note**
- **Ask before pushing.** If user approves, use: **`rp push -f`**.

---

### `rp publish`
**Purpose:** Publish the current **draft** version to **live** (existing live-based policies reference the newly published version).

**Flags**
- `-f` / `--force` — Ignore confirmation step and force publish.

**Note**
- **Ask before publishing. Do not run automatically.**

---

### `rp render`
**Purpose:** Render document templates locally into `./sandbox/output` (PDF per valid HTML doc in `./documents`).

**Flags**
- `-m` / `--merge` — Execute handlebars and inject merge vars from `/sandbox/merge-vars.json`.
- `-p <policy id>` / `--policy-id <policy id>` — Fetch merge vars for an existing sandbox policy id (ignored if merge flag is false).
- `-w` / `--watch` — Live-reload; re-render documents when template/merge-var files change.

**Example**
```bash
$ rp render -m -w
Documents successfully generated in the './sandbox' directory with merge-vars injected.
Watching for template or merge-var changes to re-render documents.
```

---

### `rp test`
**Purpose:** Run tests in `code > unit-tests` locally (all `*.js` files appended to product module code, then executed).

**Flags**
- `-w` / `--watch` — Re-run test suite when code or test files change.

**Example**
```bash
$ rp test -w rp test -w
Started test suite.


  getQuote
    ✓ should return an integer suggested premium
    ✓ should return a suggested premium of R115.17 (in cents)


  2 passing (8ms)

Completed test suite.
Watching for code or test file changes.
```

---

### `rp lint`
**Purpose:** Run eslint on product module code.

**Flags**
- `-f` / `--fix` — Automatically apply eslint fixes.

---

### `rp logs`
**Purpose:** Display recent sandbox execution logs for the product module.

**Flags**
- `-c` / `--count` — Number of code runs to fetch logs for.
- `-f` / `--function-name` — Filter by function name (e.g., `validateQuoteRequest`).
- `-p` / `--policy-id` — Filter by policy id.
- `-s` / `--status` — Filter by policy lifecycle status.

**Example**
```bash
$ rp logs
2023-04-14T05:44:28.281Z [complete] validateQuoteRequest
No logs

2023-04-14T05:44:30.071Z [failed] getQuote
2023-04-14T05:44:32.683Z [error] Product module code execution terminated due to a code error.
2023-04-14T05:44:32.680Z [error] Error: "Expecting value: line 1 column 1 (char 0)"
2023-04-14T05:44:32.675Z [debug] {
  nominated_start_date: '2023-04-05',
  name: { title: 'mr', first_name: 'John', last_name: 'Doe' },
  gender: 'M',
  date_of_birth: '1990-01-01',
  occupation_type: 'employed'
 }
2023-04-14T05:46:56.864Z [failed] validateQuoteRequest
2023-04-14T05:46:58.571Z [error] Product module code execution terminated due to a code error.
2023-04-14T05:46:58.568Z [error] Validation failed
```

---

### `rp generate`
**Purpose:** Generate workflow schemas, payloads, and API docs from Joi validation in product module code. Saves schemas/API docs in **`./sandbox`** and payloads in **`/payloads`**.

**Flags**
- `-w <step>` / `--workflow <step>` — Generate workflow schema for step: **quote**, **application**, **alterations**.
- `-p <step>` / `--payload <step>` — Generate payload for step: **quote**, **application**, **alterations**.
- `-ad` / `--api-docs` — Generate API reference skeleton for **quote** and **application**.

**Examples**
```bash
$ rp generate -w application
Schemas successfully generated in the './sandbox' directory
```
```bash
$ rp generate -p application
Payloads successfully generated in the 'payloads' directory
```
```bash
$ rp generate -ad
API docs successfully generated in the './sandbox' directory
```

---

### `rp invoke`
**Purpose:** Create a quote, application, and/or policy in **sandbox** mode (default flow completes quote → policyholder → application → issue policy). Uses payloads in `./payloads`.

**Required files/paths**
- `./payloads/quote.json`
- `./payloads/application.json`

**Flags**
- `-q` / `--quote` — Create only a quote; display quote package in terminal.
- `-a` / `--application` — Create quote + application; display application in terminal.
- `-c` / `--claim` — Create a policy and open a related claim.
- `-l` / `--live` — Use the live version of the product module.
- `-v` / `--verbose` — Display quote, application, and policy objects created.

**Example**
```bash
$ rp invoke --claim
Claim opened successfully! Click here to view on dashboard.
```

---

### `rp diff`
**Purpose:** Show line-by-line local changes vs latest **draft** in CLI.

**Flags**
- `-c` / `--code` — Diff code files in `./code`.
- `-ut` / `--unit-tests` — Diff unit tests specifically.
- `-d` / `--documents` — Diff document files (e.g., policy-schedule.html, certificate.html, quote-summary.html, anniversary-letter.html, member-certificate.html). (Terms file: indicates change but no line-by-line.)
- `-ad` / `--api-docs` — Diff `api-docs.yaml`.
- `-rm` / `--read-me` — Diff `README.md`.

**Example**
```bash
$ rp diff -c
```

---

### `rp ai`
**Purpose:** AI-assisted generation (requires `.ai-auth` in product module root).

**Required file**
- `.ai-auth` (add to `.gitignore`)
```text
OPEN_AI_API_KEY=sk-12345
```

**Flags**
- `-w` / `--workflow` — Uses workflow name to generate a Joi schema in `/sandbox`.
  - Example shown as: `rp ai --workflow quote`

**Example**
```text
$ rp ai --workflow quote
Generating output via OpenAI....
Joi schema successfully generated in the './sandbox' directory
```

**CSV spec requirements**
- CSV file must be in `/specifications`
- Header row must be:
```text
field,data_type,requirement_type,validation,description,parent_key,parent_key_requirement_type
```
