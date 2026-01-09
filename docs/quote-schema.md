# Quote Schema Guide

How to build quote schemas using Root Schema Form.

## 1) Schema Overview (Root Schema Form)
- The schema **must be a JSON array of component objects**.
- Each component object is validated by `componentValidation`.
- Only `list` components may contain a nested `components` array (and lists can nest another list one level deeper, per code).

---

## 2) Critical Rules (must-follow)
### Key naming
- `key` **must not contain periods (`.`)**. Use `snake_case`.

### outputPath rules
- For most input components, `outputPath` is **optional** (but strongly recommended for predictable data mapping).
- `outputPath` is **forbidden** on: `section-header`, `horizontal-line`, `paragraph`.
- `outputPathList` is **required** on: `list` (and forbidden elsewhere).
- `outputPathAppendTo` is **only allowed** on: `list`.

### List requirements
- For `list`:
  - Always include `"outputPathList": "some_path"`.
  - Always include `"maxNumber"` (integer, positive, min 1). If not specified by product, default to **20**.

### Currency rule
- Currency validator `min`/`max` values are **integers in cents**.

### Labels
- `label` is required for all component types **except** `horizontal-line` and `blank-space` (where `label` is optional).

---

## 3) Available Component Types (extracted from validation)
These are the component `type` strings referenced directly in the Joi rules:

1. `text`
2. `number`
3. `select`
4. `country`
5. `date-picker`
6. `cellphone`
7. `checkbox`
8. `checkbox-button`
9. `multiple-checkbox`
10. `radio`
11. `radio-button`
12. `currency`
13. `currency-slider`
14. `number-slider`
15. `list`
16. `section-header`
17. `paragraph`
18. `horizontal-line`
19. `blank-space`
20. `object`

> Note: The code also does `type: Joi.string().required().valid(Object.values(BaseStoreModelType))`. The list above is the set of types explicitly handled by field rules in this file; using any other `type` will likely fail unless it is in `BaseStoreModelType` *and* compatible with the conditional rules (most unknown types will hit `key: forbidden()` and/or `validators: forbidden()` etc.).

---

## 4) Component Reference (props, fields, and one JSON example each)

### Common fields (allowed depending on type)
- `type` (required)
- `key` (required for most, optional for `horizontal-line` / `blank-space`)
- `label` (required for most)
- `props` (optional object; see per-prop rules below)
- `displayConditions` (allowed for many types)
- `validators` (allowed only for certain types; type-specific)
- `defaultValue` (only `checkbox` and `multiple-checkbox`)
- `options` (only `select`, `radio`, `radio-button`, `multiple-checkbox`, `checkbox-button`)
- `outputPath` (optional for most inputs; forbidden for `section-header`, `horizontal-line`, `paragraph`)
- `sectionIndex` (optional number <= 55)

---

### 4.1 `text`
**Allows**
- `key` (required), `label` (required), `outputPath` (optional), `validators` (text validators), `props.prefix` (allowed), `props.placeholder` (allowed)

**Example**
```json
[
  {
    "key": "first_name",
    "type": "text",
    "label": "First name *",
    "outputPath": "first_name",
    "props": { "placeholder": "e.g. Sam" },
    "validators": [
      { "validation": { "type": "required" } },
      { "validation": { "type": "greaterThanEqualsToLength", "min": 2 } },
      { "validation": { "type": "lessThanEqualsToLength", "max": 50 } }
    ]
  }
]
```

---

### 4.2 `number`
**Allows**
- `validators` must be **number validators**
- `props.decimal` (allowed), `props.numberAsString` (allowed), `props.prefix` (allowed)

**Example**
```json
[
  {
    "key": "age",
    "type": "number",
    "label": "Age *",
    "outputPath": "age",
    "props": { "decimal": false, "numberAsString": false },
    "validators": [
      { "validation": { "type": "required" } },
      { "validation": { "type": "greaterThanEqualsToNumber", "min": 18 } },
      { "validation": { "type": "lessThanEqualsToNumber", "max": 120 } }
    ]
  }
]
```

---

### 4.3 `select`
**Allows**
- `options` required: array of `{ label, value }` where value can be string/number/boolean
- `validators` uses **text/select validators**

**Example**
```json
[
  {
    "key": "vehicle_use",
    "type": "select",
    "label": "Vehicle use *",
    "outputPath": "vehicle_use",
    "options": [
      { "label": "Personal", "value": "personal" },
      { "label": "Business", "value": "business" }
    ],
    "validators": [
      { "validation": { "type": "required" } }
    ]
  }
]
```

---

### 4.4 `country`
**Allows**
- `validators` uses **text/select validators**
- (No `options` allowed here per schema—`options` is forbidden unless type matches)

**Example**
```json
[
  {
    "key": "country_of_residence",
    "type": "country",
    "label": "Country of residence *",
    "outputPath": "country_of_residence",
    "validators": [
      { "validation": { "type": "required" } }
    ]
  }
]
```

---

### 4.5 `date-picker`
**Allows**
- `validators` uses **text/select validators** (note: only types listed in `validators` are allowed; there is no date-specific validator type)

**Example**
```json
[
  {
    "key": "date_of_birth",
    "type": "date-picker",
    "label": "Date of birth *",
    "outputPath": "date_of_birth",
    "validators": [
      { "validation": { "type": "required" } }
    ]
  }
]
```

---

### 4.6 `cellphone`
**Allows**
- `validators` uses **text/select validators** (e.g., `required`, `lessThanLength`, etc.)

**Example**
```json
[
  {
    "key": "mobile_number",
    "type": "cellphone",
    "label": "Mobile number *",
    "outputPath": "mobile_number",
    "validators": [
      { "validation": { "type": "required" } },
      { "validation": { "type": "greaterThanEqualsToLength", "min": 10 } },
      { "validation": { "type": "lessThanEqualsToLength", "max": 15 } }
    ]
  }
]
```

---

### 4.7 `checkbox`
**Allows**
- `defaultValue` optional (boolean or string allowed by schema)
- `validators` uses **checkbox validators**: `required`, `equals` (with boolean `value`)

**Example**
```json
[
  {
    "key": "accept_terms",
    "type": "checkbox",
    "label": "I accept the terms *",
    "outputPath": "accept_terms",
    "defaultValue": false,
    "validators": [
      { "validation": { "type": "equals", "value": true } }
    ]
  }
]
```

---

### 4.8 `checkbox-button`
**Allows**
- `options` required and must be **length 2**, values must be **strict booleans**
- `validators` uses **checkbox-button validators** (`required`, `equals` boolean)

**Example**
```json
[
  {
    "key": "has_alarm",
    "type": "checkbox-button",
    "label": "Alarm installed? *",
    "outputPath": "has_alarm",
    "options": [
      { "label": "Yes", "value": true },
      { "label": "No", "value": false }
    ],
    "validators": [
      { "validation": { "type": "required" } }
    ]
  }
]
```

---

### 4.9 `multiple-checkbox`
**Allows**
- `options` required: `{label, value}` (value string/number/boolean)
- `defaultValue` optional but must be an **object**
- `validators`: `required` or `equals` (with **object** `value`)

**Example**
```json
[
  {
    "key": "safety_features",
    "type": "multiple-checkbox",
    "label": "Safety features",
    "outputPath": "safety_features",
    "options": [
      { "label": "ABS", "value": "abs" },
      { "label": "Airbags", "value": "airbags" },
      { "label": "Tracker", "value": "tracker" }
    ],
    "defaultValue": { "abs": false, "airbags": true, "tracker": false },
    "validators": [
      { "validation": { "type": "required" } }
    ]
  }
]
```

---

### 4.10 `radio`
**Allows**
- `options` required
- `validators` uses **text/select validators**

**Example**
```json
[
  {
    "key": "marital_status",
    "type": "radio",
    "label": "Marital status *",
    "outputPath": "marital_status",
    "options": [
      { "label": "Single", "value": "single" },
      { "label": "Married", "value": "married" }
    ],
    "validators": [
      { "validation": { "type": "required" } }
    ]
  }
]
```

---

### 4.11 `radio-button`
Same rules as `radio`.

**Example**
```json
[
  {
    "key": "parking_type",
    "type": "radio-button",
    "label": "Parking type *",
    "outputPath": "parking_type",
    "options": [
      { "label": "Garage", "value": "garage" },
      { "label": "Street", "value": "street" }
    ],
    "validators": [
      { "validation": { "type": "required" } }
    ]
  }
]
```

---

### 4.12 `currency`
**Allows**
- `validators` must be **currency validators**
- `props.prefix` allowed (e.g. `$`, `R`)

**Example (cents)**
```json
[
  {
    "key": "coverage_amount",
    "type": "currency",
    "label": "Coverage amount *",
    "outputPath": "coverage_amount",
    "props": { "prefix": "$" },
    "validators": [
      { "validation": { "type": "required" } },
      { "validation": { "type": "greaterThanEqualsToCurrency", "min": 100000 } },
      { "validation": { "type": "lessThanEqualsToCurrency", "max": 5000000 } }
    ]
  }
]
```

---

### 4.13 `currency-slider`
**Allows**
- `validators` must be **currency validators**
- `props.increment` allowed
- `props.prefix` allowed

**Example**
```json
[
  {
    "key": "deductible",
    "type": "currency-slider",
    "label": "Deductible *",
    "outputPath": "deductible",
    "props": { "prefix": "$", "increment": 5000 },
    "validators": [
      { "validation": { "type": "required" } },
      { "validation": { "type": "greaterThanEqualsToCurrency", "min": 0 } },
      { "validation": { "type": "lessThanEqualsToCurrency", "max": 200000 } }
    ]
  }
]
```

---

### 4.14 `number-slider`
**Allows**
- `validators` must be **number validators**
- `props.increment` allowed
- `props.prefix` allowed

**Example**
```json
[
  {
    "key": "years_licensed",
    "type": "number-slider",
    "label": "Years licensed *",
    "outputPath": "years_licensed",
    "props": { "increment": 1 },
    "validators": [
      { "validation": { "type": "required" } },
      { "validation": { "type": "greaterThanEqualsToNumber", "min": 0 } },
      { "validation": { "type": "lessThanEqualsToNumber", "max": 80 } }
    ]
  }
]
```

---

### 4.15 `list`
**Allows**
- `components` required (nested array of components)
- `outputPathList` **required**
- `maxNumber` **required by your process** (code requires if present; your instruction says always include; use 20 default)
- `minNumber` optional
- `outputPathAppendTo` optional
- `props.addButtonLabel`, `props.removeButtonLabel`, `props.arrayValues` allowed
- `validators` uses **text/select validators** (not number/currency validators)

**Example**
```json
[
  {
    "type": "list",
    "label": "Drivers",
    "outputPathList": "drivers",
    "maxNumber": 20,
    "props": {
      "addButtonLabel": "Add driver",
      "removeButtonLabel": "Remove driver"
    },
    "components": [
      {
        "type": "section-header",
        "label": "Driver",
        "props": { "headingTag": "h6", "indexNumber": true }
      },
      {
        "key": "driver_name",
        "type": "text",
        "label": "Name *",
        "outputPath": "drivers.driver_name",
        "validators": [{ "validation": { "type": "required" } }]
      },
      {
        "key": "driver_age",
        "type": "number",
        "label": "Age *",
        "outputPath": "drivers.driver_age",
        "validators": [
          { "validation": { "type": "required" } },
          { "validation": { "type": "greaterThanEqualsToNumber", "min": 18 } }
        ]
      }
    ]
  }
]
```

---

### 4.16 `section-header`
**Allows**
- `props.headingTag` optional (`h1`-`h6`)
- `props.fontWeight` optional
- `props.indexNumber` allowed only here
- `outputPath` is **forbidden**
- `key` is required (per schema)

**Example**
```json
[
  {
    "key": "driver_section_header",
    "type": "section-header",
    "label": "Driver details",
    "props": { "headingTag": "h5", "fontWeight": "bold" }
  }
]
```

---

### 4.17 `paragraph`
**Allows**
- `outputPath` forbidden
- `key` required (per schema)

**Example**
```json
[
  {
    "key": "privacy_paragraph",
    "type": "paragraph",
    "label": "We use your information to provide a quote."
  }
]
```

---

### 4.18 `horizontal-line`
**Allows**
- `key` optional
- `label` optional
- `outputPath` forbidden

**Example**
```json
[
  {
    "type": "horizontal-line"
  }
]
```

---

### 4.19 `blank-space`
**Allows**
- `key` optional
- `label` optional

**Example**
```json
[
  {
    "type": "blank-space",
    "props": { "colWidth": 12 }
  }
]
```

---

### 4.20 `object`
**Allows**
- `key` required, `label` required
- `displayConditions` allowed
- `validators` are **forbidden** (falls through to `Joi.forbidden()`)
- No `components` unless it is inside a `list` and only `list` can have `components`

**Example**
```json
[
  {
    "key": "metadata",
    "type": "object",
    "label": "Metadata",
    "outputPath": "metadata",
    "props": { "hiddenComponent": true }
  }
]
```

---

## 5) Validators Reference (ALL valid type strings + structures)

### 5.1 Text-like validators (`text`, `select`, `country`, `date-picker`, `cellphone`, `radio`, `radio-button`, `list`)
Allowed `validation.type`:
- `za_id`
- `email`
- `required`
- `imei`
- `greaterThanLength` (requires `min` integer)
- `greaterThanEqualsToLength` (requires `min` integer)
- `lessThanLength` (requires `max` integer)
- `lessThanEqualsToLength` (requires `max` integer)

Examples:
```json
{ "validation": { "type": "required" } }
```
```json
{ "validation": { "type": "email" } }
```
```json
{ "validation": { "type": "greaterThanEqualsToLength", "min": 2 } }
```
```json
{ "validation": { "type": "lessThanEqualsToLength", "max": 50 } }
```

---

### 5.2 Number validators (`number`, `number-slider`)
Allowed `validation.type`:
- `greaterThanNumber` (requires `min` integer)
- `greaterThanEqualsToNumber` (requires `min` integer)
- `lessThanNumber` (requires `max` integer)
- `lessThanEqualsToNumber` (requires `max` integer)
- `imei`
- `required`

Examples:
```json
{ "validation": { "type": "greaterThanEqualsToNumber", "min": 18 } }
```
```json
{ "validation": { "type": "lessThanNumber", "max": 200 } }
```

---

### 5.3 Currency validators (`currency`, `currency-slider`) — values in cents
Allowed `validation.type`:
- `za_id`
- `greaterThanCurrency` (requires `min` integer, cents)
- `greaterThanEqualsToCurrency` (requires `min` integer, cents)
- `lessThanCurrency` (requires `max` integer, cents)
- `lessThanEqualsToCurrency` (requires `max` integer, cents)
- `greaterThanLength` (requires `min` integer)
- `greaterThanEqualsToLength` (requires `min` integer)
- `lessThanLength` (requires `max` integer)
- `lessThanEqualsToLength` (requires `max` integer)
- `imei`
- `required`

Examples:
```json
{ "validation": { "type": "greaterThanEqualsToCurrency", "min": 10000 } }
```
```json
{ "validation": { "type": "lessThanEqualsToCurrency", "max": 500000 } }
```

---

### 5.4 Checkbox validators (`checkbox`, `checkbox-button`)
Allowed `validation.type`:
- `required`
- `equals` (requires `value` boolean)

Examples:
```json
{ "validation": { "type": "required" } }
```
```json
{ "validation": { "type": "equals", "value": true } }
```

---

### 5.5 Multiple-checkbox validators (`multiple-checkbox`)
Allowed `validation.type`:
- `required`
- `equals` (requires `value` object)

Example:
```json
{ "validation": { "type": "equals", "value": { "abs": true } } }
```

---

## 6) Display Conditions (show/hide logic)
### Where allowed
`displayConditions` is allowed on:
- `select`, `country`, `date-picker`, `blank-space`, `horizontal-line`, `paragraph`, `section-header`,
  `checkbox`, `multiple-checkbox`, `cellphone`, `radio`, `radio-button`,
  `currency`, `currency-slider`, `number-slider`, `list`, `text`, `number`, `object`

### Structure
`displayConditions` is an **array** of condition objects. Each object supports:
- `path` (string, required)
- `condition` one of: `===`, `!==`, `>=`, `<=` (required)
- `value`:
  - if condition is `>=` or `<=`: must be a **number**
  - otherwise: string (can be empty), number, boolean, or null
- optional nested `and` / `or` arrays, which can contain similar objects (with limited nesting as shown in code)

**Example**
```json
[
  {
    "key": "secondary_driver_name",
    "type": "text",
    "label": "Secondary driver name",
    "outputPath": "secondary_driver_name",
    "displayConditions": [
      {
        "path": "has_secondary_driver",
        "condition": "===",
        "value": true
      }
    ]
  }
]
```

---

## 7) List Components (nesting + output paths)
- `list.components` is allowed only when `type` is `list`.
- Inside a list’s `components`, you may include another `list`, and that nested list may include components as well (as per the nested Joi rule).
- `outputPathList` is required on each `list`.
- You may optionally use `outputPathAppendTo` on a `list`.

---

## 8) CRITICAL: FORBIDDEN PROPERTIES AND ANTI-PATTERNS (MANDATORY)

### FORBIDDEN COMPONENT PROPERTIES
| Property | Why It Fails |
|----------|--------------|
| description | Not a valid component field |
| tooltip | Not a valid component field |
| hint | Not a valid component field |
| help | Not a valid component field |
| required | Use validators array with `{ "validation": { "type": "required" } }` instead |

### FORBIDDEN VALIDATOR PROPERTIES
| Property | Why It Fails | Correct Alternative |
|----------|--------------|---------------------|
| errorMessage | Not in validator schema | Remove entirely |
| message | Not in validator schema | Remove entirely |
| minValue | Wrong property name | Use `min` |
| maxValue | Wrong property name | Use `max` |
| length | Wrong property name | Use `min` or `max` (depending on validator type) |
| minLength | Wrong property name | Use `{ "type": "greaterThanEqualsToLength", "min": X }` |
| maxLength | Wrong property name | Use `{ "type": "lessThanEqualsToLength", "max": X }` |

### INVALID COMPONENT TYPES
| Invalid Type | Correct Alternative |
|--------------|---------------------|
| date | date-picker |
| html | paragraph or section-header |
| input | text |
| string | text |
| dropdown | select |
| slider | number-slider or currency-slider |
| money | currency |
| phone | cellphone |
| boolean | checkbox or checkbox-button |

### INVALID VALIDATOR TYPES
| Invalid Type | Correct Alternative |
|--------------|---------------------|
| range | Use separate `greaterThanNumber` + `lessThanNumber` |
| min | `greaterThanNumber` or `greaterThanEqualsToNumber` |
| max | `lessThanNumber` or `lessThanEqualsToNumber` |
| pattern | Not supported |
| regex | Not supported |
| minLength | `greaterThanLength` or `greaterThanEqualsToLength` |
| maxLength | `lessThanLength` or `lessThanEqualsToLength` |

### WRONG vs CORRECT EXAMPLES

WRONG - Using forbidden properties:
```json
{ "key": "email", "type": "text", "label": "Email", "description": "Enter email", "validators": [{ "validation": { "type": "required" }, "errorMessage": "Required" }] }
```

CORRECT - No forbidden properties:
```json
{ "key": "email", "type": "text", "label": "Email *", "outputPath": "email", "validators": [{ "validation": { "type": "required" } }, { "validation": { "type": "email" } }] }
```

WRONG - Using invalid validator:
```json
{ "validators": [{ "validation": { "type": "range", "minValue": 18, "maxValue": 65 } }] }
```

CORRECT - Using valid validators:
```json
{ "validators": [{ "validation": { "type": "greaterThanEqualsToNumber", "min": 18 } }, { "validation": { "type": "lessThanEqualsToNumber", "max": 65 } }] }
```

### Additional anti-patterns directly implied by the Joi rules
- Putting `options` on anything other than `select`, `radio`, `radio-button`, `multiple-checkbox`, `checkbox-button` → **fails** (`options` forbidden).
- Putting `defaultValue` on anything other than `checkbox` or `multiple-checkbox` → **fails**.
- Adding `validators` to `object`, `paragraph`, `section-header`, `horizontal-line`, `blank-space`, `checkbox`? (checkbox is allowed) → **fails** depending on type; `object` validators are forbidden explicitly.
- Using `outputPath` on `paragraph`, `section-header`, `horizontal-line` → **fails** (forbidden).
- Using `props.increment` on non-slider types → **fails**.
- Using `props.decimal` or `props.numberAsString` on non-`number` → **fails**.
- Using `props.addButtonLabel/removeButtonLabel/arrayValues` on non-`list` → **fails**.
- `checkbox-button.options` must be exactly length **2** and values must be **boolean (strict)** → anything else fails.

---

## 9) Complete Example (multi-component, copy/paste)
```json
[
  {
    "key": "quote_header",
    "type": "section-header",
    "label": "Quote details",
    "props": { "headingTag": "h5", "fontWeight": "bold" }
  },
  {
    "key": "email",
    "type": "text",
    "label": "Email *",
    "outputPath": "email",
    "validators": [
      { "validation": { "type": "required" } },
      { "validation": { "type": "email" } }
    ]
  },
  {
    "key": "monthly_budget",
    "type": "currency",
    "label": "Monthly budget *",
    "outputPath": "monthly_budget",
    "props": { "prefix": "$" },
    "validators": [
      { "validation": { "type": "required" } },
      { "validation": { "type": "greaterThanEqualsToCurrency", "min": 5000 } },
      { "validation": { "type": "lessThanEqualsToCurrency", "max": 200000 } }
    ]
  },
  {
    "key": "contact_me",
    "type": "checkbox-button",
    "label": "May we contact you? *",
    "outputPath": "contact_me",
    "options": [
      { "label": "Yes", "value": true },
      { "label": "No", "value": false }
    ],
    "validators": [
      { "validation": { "type": "required" } }
    ]
  },
  {
    "type": "list",
    "label": "Additional insured items",
    "outputPathList": "insured_items",
    "maxNumber": 20,
    "props": { "addButtonLabel": "Add item", "removeButtonLabel": "Remove item" },
    "components": [
      {
        "type": "section-header",
        "label": "Item",
        "key": "item_header",
        "props": { "headingTag": "h6", "indexNumber": true }
      },
      {
        "key": "item_name",
        "type": "text",
        "label": "Item name *",
        "outputPath": "insured_items.item_name",
        "validators": [
          { "validation": { "type": "required" } },
          { "validation": { "type": "lessThanEqualsToLength", "max": 80 } }
        ]
      },
      {
        "key": "item_value",
        "type": "currency",
        "label": "Item value *",
        "outputPath": "insured_items.item_value",
        "props": { "prefix": "$" },
        "validators": [
          { "validation": { "type": "required" } },
          { "validation": { "type": "greaterThanEqualsToCurrency", "min": 100 } }
        ]
      }
    ]
  }
]
```
