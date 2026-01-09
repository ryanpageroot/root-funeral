# Claim Blocks Guide

How to configure claim workflow blocks.

## 1. Claim Blocks Overview

Claim blocks are a small DSL for defining “steps” in a claim workflow UI. Each block definition describes **what to render** (inputs, selections, display-only content, or actions like payouts) and is stored in a wrapper object that can also express **conditional rendering/behavior** (`show_if`, `hide_if`, `disabled_if`, `required_if`).

Separately, each block type has a corresponding **block state** shape that captures **what the user selected/entered** (or what IDs/statuses were created by action blocks). Block states are serialized to JSON and later rehydrated.

---

## 2. Block Types Reference

### Block type strings (as used in definitions/states)
```json
{
  "input-text": "input.text",
  "input-currency": "input.currency",
  "input-paragraph": "input.paragraph",
  "input-date": "input.date",
  "input-time": "input.time",
  "input-number": "input.number",
  "radio": "radio",
  "checkbox": "checkbox",
  "dropdown": "dropdown",
  "markdown": "markdown",
  "heading": "heading",
  "divider": "divider",
  "alert": "alert",
  "payout-request": "payout_request",
  "fulfillment-request": "fulfillment_request",
  "annuity-request": "annuity_request",
  "group": "group"
}
```

---

### Input Blocks

#### A) `input.text`
**Definition (block)**
- Required: `type`, `key`, `title`
- Optional: `description`, `placeholder`, `max_length`, `min_length`

**State captured**
- `type`
- `value` (string; allows empty string)

**State JSON**
```json
{ "type": "input.text", "value": "some text" }
```

---

#### B) `input.number`
**Definition (block)**
- Required: `type`, `key`, `title`
- Optional: `description`, `placeholder` (number), `max` (number), `min` (number)

**State captured**
- `type`
- `value` (number; allows `null`)

**State JSON**
```json
{ "type": "input.number", "value": 42 }
```

---

#### C) `input.currency`
**Definition (block)**
- Required: `type`, `key`, `title`
- Optional: `isoCode` (currency code), `placeholder` (number), `description`, `max` (number), `min` (number)

**State captured**
- `type`
- `value` (integer number, `min(0)`)

**State JSON**
```json
{ "type": "input.currency", "value": 1500 }
```

---

#### D) `input.date`
**Definition (block)**
- Required: `type`, `key`, `title`
- Optional (note underscore naming in validation):  
  - `description`
  - `default_value` (string, allow `""`)
  - `placeholder` (string, allow `""`)
  - `max` (string, allow `""`)
  - `min` (string, allow `""`)

**State captured**
- `type`
- `value` (ISO date string; allows empty string)
- Rehydration is timezone-aware (stored/rehydrated via org timezone then converted to UTC)

**State JSON**
```json
{ "type": "input.date", "value": "2025-01-01T00:00:00.000Z" }
```

---

#### E) `input.time`
**Definition (block)**
- Required: `type`, `key`, `title`
- Optional: `description`, `placeholder` (string), `default_value` (string)

**State captured**
- `type`
- `value` (string matching `HH:MM` 24h; allows `""`)

**State JSON**
```json
{ "type": "input.time", "value": "13:45" }
```

---

#### F) `input.paragraph`
**Definition (block)**
- Required: `type`, `key`, `title`
- Optional: `description`, `placeholder`, `max_length`, `min_length`

**State captured**
- `type`
- `value` (string; allows empty string)

**State JSON**
```json
{ "type": "input.paragraph", "value": "Longer text..." }
```

---

### Selection Blocks

#### G) `dropdown`
**Definition (block)**
- Required: `type`, `key`, `title`
- Optional:
  - `description` (allows `""`)
  - `default_value` (string, allows `""`)
  - `options`: array of `{ key, value }`
  - `datastore`:
    - Required inside datastore: `datastore_key`, `option_key`, `option_value`
    - Optional inside datastore: `limit` (min 1; max is config-driven)

**State captured**
- `type`
- `option_key` (string; allows `""`)
- `option_value` (string; allows `""`)

**State JSON**
```json
{ "type": "dropdown", "option_key": "za", "option_value": "South Africa" }
```

---

#### H) `radio`
**Definition (block)**
- Required: `type`, `key`, `title`, `options` (array of `{ key, value }`)
- Optional: `description`, `default_value` (string; allows `""`)

**State captured**
- `type`
- `option_key` (string; allows `""`)
- `option_value` (string; allows `""`)

**State JSON**
```json
{ "type": "radio", "option_key": "yes", "option_value": "Yes" }
```

---

#### I) `checkbox`
**Definition (block)**
- Required: `type`, `key`, `title`, `default_value` (boolean)  
  *(Schema marks `default_value` as required.)*

**State captured**
- `type`
- `value` (boolean)

**State JSON**
```json
{ "type": "checkbox", "value": true }
```

---

### Display Blocks

#### J) `heading`
**Definition (block)**
- Required: `type`, `key`, `title`

**State captured**
- `type` only

**State JSON**
```json
{ "type": "heading" }
```

---

#### K) `markdown`
**Definition (block)**
- Required: `type`, `key`, `markdown`

**State captured**
- `type` only

**State JSON**
```json
{ "type": "markdown" }
```

---

#### L) `alert`
**Definition (block)**
- Required: `type`, `key`, `markdown`, `color`
- `color` can be either:
  - a value in `AlertColor` enum (below), OR
  - a templated string matching `{{ some.path }}`

**AlertColor enum values**
- `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark`

**State captured**
- `type` only

**State JSON**
```json
{ "type": "alert" }
```

---

#### M) `divider`
**Definition (block)**
- Required: `type`, `key`

**State captured**
- `type` only

**State JSON**
```json
{ "type": "divider" }
```

---

### Action Blocks

#### N) `payout_request`
**Definition (block)**
- Required: `type`, `key`, `title`, `amount`, `payee`
- Optional: `description`

**Definition: `payee` object**
- Required:
  - `amount` (string)
  - `type` (string)
  - `percentage` (string or number)
- Conditionally required/forbidden based on `payee.type`:
  - If `type == "policyholder"`:
    - `policyholder_id` required
    - beneficiary fields forbidden
  - If `type == "beneficiary"`:
    - `first_name` required
    - `last_name` required
    - `date_of_birth` optional (dateOfBirth format)
    - `identification` optional:
      - `{ type: "id"|"passport", number: string (idNumber when type=="id"), country: validCountryCodes }`
    - `cellphone` optional; can be `""` or `null`; supports:
      - string, OR `{ country, number }`
    - `email` optional; email string; can be `""` or `null`
- Optional:
  - `payment_details`:
    - `type` must be `"eft"`
    - `details`: `{ bank_name, branch_code, account_type, account_number }` (all required)

**State captured**
- `type`
- `payout_request_id` (UUID string)
- `status` (one of `PayoutRequestStatus` values)

**State JSON**
```json
{
  "type": "payout_request",
  "payout_request_id": "2f1a3c6e-1111-2222-3333-444455556666",
  "status": "SOME_STATUS_VALUE"
}
```

---

#### O) `fulfillment_request`
**Definition (block)**
- Required: `type`, `key`, `title`, `description`, `fulfillment_type_key`, `fulfillment_data` (object)

**State captured**
- `type`
- `fulfillment_request_id` (UUID string)
- `status` (one of `FulfillmentRequestStatus` values)

**State JSON**
```json
{
  "type": "fulfillment_request",
  "fulfillment_request_id": "9c2d7c7a-1111-2222-3333-444455556666",
  "status": "SOME_STATUS_VALUE"
}
```

---

#### P) `annuity_request`
**Definition (block)**
- Required: `type`, `key`, `description`, `frequency`, `duration`, `amount`
- `frequency`:
  - `type` (AnnuityFrequencyType)
  - `time_of_day` string matching `HH:00` or `HH:30` (`^(?:\d|[01]\d|2[0-3]):[30]0$`)
  - `day_of_month` number 1..31 (required depending on `type` per schema logic)
  - `month_of_year` number 1..12 (required if `type` is `Yearly`, otherwise forbidden)
- `duration`:
  - `count` optional (string or number)
  - `end_date` optional (string)
- `amount` string or number

**State captured**
- `type`
- `annuity_request_id` (UUID string)

**State JSON**
```json
{
  "type": "annuity_request",
  "annuity_request_id": "0a1b2c3d-1111-2222-3333-444455556666"
}
```

---

### Q) `group`
**Definition (block)**
- Required: `type`, `key`, `title`, `collapsible`, `blocks`
- `blocks` is an array of **BlockStoreModel** wrappers (see below), but only “nestable” block types are allowed inside a group:
  - Allowed inside group: `alert`, `checkbox`, `divider`, `dropdown`, `heading`, `input.currency`, `input.text`, `input.time`, `input.date`, `input.number`, `input.paragraph`, `markdown`, `radio`
  - Not allowed inside group: `group`, `annuity_request`, `fulfillment_request`, `payout_request`

**State captured**
- `type` only

**State JSON**
```json
{ "type": "group" }
```

---

## 3. Block Properties (Common Wrapper / Store Model)

Blocks are stored in a wrapper called **BlockStoreModel**:

```json
{
  "show_if": "string|boolean (optional)",
  "hide_if": "string|boolean (required in model interface)",
  "disabled_if": "string|boolean (required in model interface)",
  "required_if": "string|boolean (required in model interface)",
  "block": { "...actual block definition..." }
}
```

Notes from validation usage:
- In schema validation for blocks (top-level and inside group), `show_if`, `hide_if`, `disabled_if`, `required_if` are treated as **optional** and accept strings plus `true/false/""/null`.

> The source does **not** define universal properties like `label`, `isRequired`, `isDisabled`, or `displayCondition`. Instead, it uses `title` on many blocks and the wrapper condition fields above.

---

## 4. Display Conditions

Conditions exist on the wrapper object, not inside the block:
- `show_if`
- `hide_if`
- `disabled_if`
- `required_if`

They can be booleans or strings. The string format is not defined in this file set (but validation allows a string or `true/false/""/null`).

**Example pattern**
```json
{
  "show_if": "{{ claim.some_flag }}",
  "block": {
    "type": "input.text",
    "key": "notes",
    "title": "Additional notes",
    "placeholder": "Enter details"
  }
}
```

**Group-nested example**
```json
{
  "block": {
    "type": "group",
    "key": "incident_group",
    "title": "Incident details",
    "collapsible": true,
    "blocks": [
      {
        "required_if": "{{ claim.requires_time }}",
        "block": { "type": "input.time", "key": "incident_time", "title": "Time of incident" }
      }
    ]
  }
}
```

---

## 5. Payout/Fulfillment Blocks

### Payout request (`payout_request`)
- **Definition** includes payout metadata (`amount`, `payee`, optional `payment_details`).
- **State** stores the created payout request record link + lifecycle:
  - `payout_request_id` (UUID string)
  - `status` (enum value)

### Fulfillment request (`fulfillment_request`)
- **Definition** includes:
  - `fulfillment_type_key` (string)
  - `fulfillment_data` (object)
- **State** stores:
  - `fulfillment_request_id` (UUID string)
  - `status` (enum value)

### Annuity request (`annuity_request`)
- **Definition** includes frequency, duration, amount
- **State** stores:
  - `annuity_request_id` (UUID string)

---

## 6. Group Blocks (nesting)

`group` blocks bundle related blocks under a common title, optionally collapsible.

**Key rules**
- `group.blocks` contains an array of wrapper objects shaped like `BlockStoreModel` (`show_if`, `hide_if`, `disabled_if`, `required_if`, `block`).
- Only specific block types are allowed inside a group (no nested `group`, and no action blocks).

**Minimal group example**
```json
{
  "block": {
    "type": "group",
    "key": "policyholder_info",
    "title": "Policyholder info",
    "collapsible": false,
    "blocks": [
      {
        "block": {
          "type": "input.text",
          "key": "ph_name",
          "title": "Name"
        }
      },
      {
        "block": {
          "type": "checkbox",
          "key": "ph_confirmed",
          "title": "I confirm these details are correct",
          "default_value": false
        }
      }
    ]
  }
}
```

---

## 7. Block State Reference (capture + serialization)

Block states are stored as a map keyed by the block `key` in the schema; each value is a JSON object that always contains `type` plus any state fields.

### State shapes by type

| Block type | State fields (serialized) |
|---|---|
| `heading` | `{ type }` |
| `divider` | `{ type }` |
| `markdown` | `{ type }` |
| `alert` | `{ type }` |
| `group` | `{ type }` |
| `input.text` | `{ type, value: string }` |
| `input.paragraph` | `{ type, value: string }` |
| `input.number` | `{ type, value: number \| null }` |
| `input.currency` | `{ type, value: number }` (integer, min 0) |
| `input.time` | `{ type, value: string }` (allows `""`, expects `HH:MM`) |
| `input.date` | `{ type, value: string }` (ISO string or `""`; rehydrated with org timezone then stored as UTC moment) |
| `dropdown` | `{ type, option_key: string, option_value: string }` |
| `radio` | `{ type, option_key: string, option_value: string }` |
| `checkbox` | `{ type, value: boolean }` |
| `payout_request` | `{ type, payout_request_id: uuid, status }` |
| `fulfillment_request` | `{ type, fulfillment_request_id: uuid, status }` |
| `annuity_request` | `{ type, annuity_request_id: uuid }` |

**Example of the overall blockStates JSON map**
```json
{
  "incident_date": { "type": "input.date", "value": "2025-01-01T00:00:00.000Z" },
  "injured": { "type": "checkbox", "value": false },
  "coverage_type": { "type": "radio", "option_key": "basic", "option_value": "Basic" }
}
```

---

## 8. Complete Examples

### A) Simple claim schema example
```json
[
  {
    "block": { "type": "heading", "key": "h1", "title": "Incident details" }
  },
  {
    "block": {
      "type": "input.date",
      "key": "incident_date",
      "title": "Date of incident",
      "placeholder": "",
      "min": "",
      "max": ""
    }
  },
  {
    "block": {
      "type": "input.time",
      "key": "incident_time",
      "title": "Time of incident",
      "placeholder": "13:45"
    }
  },
  {
    "block": {
      "type": "radio",
      "key": "police_report",
      "title": "Was a police report filed?",
      "default_value": "",
      "options": [
        { "key": "yes", "value": "Yes" },
        { "key": "no", "value": "No" }
      ]
    }
  },
  {
    "block": { "type": "divider", "key": "d1" }
  },
  {
    "block": {
      "type": "markdown",
      "key": "m1",
      "markdown": "Please double-check your answers before continuing."
    }
  }
]
```

---

### B) Complex claim schema with conditions + group + action block
```json
[
  {
    "block": {
      "type": "group",
      "key": "incident_group",
      "title": "Incident",
      "collapsible": true,
      "blocks": [
        {
          "block": { "type": "input.text", "key": "location", "title": "Location" }
        },
        {
          "block": {
            "type": "dropdown",
            "key": "country",
            "title": "Country",
            "default_value": "",
            "options": [
              { "key": "US", "value": "United States" },
              { "key": "ZA", "value": "South Africa" }
            ]
          }
        },
        {
          "show_if": "{{ claim.needs_more_info }}",
          "block": {
            "type": "alert",
            "key": "more_info_alert",
            "markdown": "We need additional information.",
            "color": "warning"
          }
        }
      ]
    }
  },
  {
    "show_if": "{{ claim.approved_for_payout }}",
    "block": {
      "type": "payout_request",
      "key": "payout_1",
      "title": "Issue payout",
      "description": "Create a payout request",
      "amount": "1000",
      "payee": {
        "amount": "1000",
        "type": "policyholder",
        "policyholder_id": "ph_123",
        "percentage": "100"
      }
    }
  }
]
```
