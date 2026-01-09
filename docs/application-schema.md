# Application Schema Guide

How to build application schemas (extends quote data).

## 1) Schema Overview

A Root schema is a **JSON array of component objects**. Each object represents a UI component (field or layout item). Validation is strict: **any property not explicitly allowed by the Joi schema will fail**.

Top-level shape:

```json
[
  { "type": "section-header", "key": "example_header", "label": "Example", "props": { "headingTag": "h5" } },
  { "key": "email", "type": "text", "label": "Email *", "outputPath": "email", "validators": [ { "validation": { "type": "required" } } ] }
]
```

---

## 2) Critical Rules (must-follow)

### Keys
- `key` is required for most component types.
- **Keys must not contain periods (`.`)** → use `snake_case`.
  - Good: `spouse_first_name`
  - Bad: `spouse.first_name`

### outputPath
- `outputPath` is **forbidden** on: `section-header`, `horizontal-line`, `paragraph`
- `outputPath` is **optional** for other input components (but you typically want it).
- **Guideline (from your context):** final segment of `outputPath` should match `key` unless duplicates exist.

### Currency rule
- **All currency min/max are integers in cents** (e.g. R100 → `10000`).

### Lists
- For `type: "list"`:
  - `outputPathList` **required**
  - `maxNumber` **required** (if unspecified by product, default to **20** per your instruction)
  - `components` **required** (array of component objects)
  - Supports **nested lists** up to one additional level (list inside list).

### Validators
- Validators must be an array of objects:
  - `[{ "validation": { ... } }]`
- Validator property names are **`min`** and **`max`** (not `minValue`, `maxValue`, `minLength`, `maxLength`, or `length`).

---

## 3) Available Component Types (from validation)

Valid `type` values (from `key`/props/validators branching in code):

- `select`
- `country`
- `date-picker`
- `paragraph`
- `section-header`
- `multiple-checkbox`
- `cellphone`
- `checkbox`
- `radio`
- `radio-button`
- `currency`
- `currency-slider`
- `number-slider`
- `text`
- `number`
- `checkbox-button`
- `object`
- `horizontal-line`
- `blank-space`
- `list`

Below: **one copy-paste JSON example per component type**.

---

### `section-header`
- Required: `type`, `key`, `label`
- Optional: `props.headingTag`, `props.fontWeight`, `props.indexNumber`, `props.colWidth`, `props.hiddenComponent`, `props.allowNull`, `sectionIndex`, `displayConditions`
- Forbidden: `outputPath`, `options`, `validators`

```json
{
  "type": "section-header",
  "key": "member_header",
  "label": "Main member",
  "props": {
    "headingTag": "h5",
    "fontWeight": "bold"
  }
}
```

---

### `paragraph`
- Required: `type`, `key`, `label`
- Forbidden: `outputPath`, `validators`, `options`

```json
{
  "type": "paragraph",
  "key": "disclosure_paragraph",
  "label": "Please answer all questions truthfully."
}
```

---

### `horizontal-line`
- Required: `type`
- Optional: `key`, `label` (label optional per schema)
- Forbidden: `outputPath`, `validators`, `options`

```json
{
  "type": "horizontal-line",
  "key": "divider_1"
}
```

---

### `blank-space`
- Required: `type`
- Optional: `key`, `label` (label optional), `displayConditions`
- Forbidden: `outputPath`, `validators`, `options`

```json
{
  "type": "blank-space",
  "key": "spacer_after_email"
}
```

---

### `text`
- Required: `type`, `key`, `label`
- Optional: `outputPath`, `props.placeholder`, `props.prefix`, `props.colWidth`, `props.hiddenComponent`, `props.allowNull`, `displayConditions`, `validators`
- Forbidden: `options`, `defaultValue`

```json
{
  "key": "first_name",
  "type": "text",
  "label": "First name *",
  "outputPath": "spouse.first_name",
  "props": {
    "placeholder": "e.g. John"
  },
  "validators": [
    { "validation": { "type": "required" } },
    { "validation": { "type": "greaterThanEqualsToLength", "min": 2 } },
    { "validation": { "type": "lessThanEqualsToLength", "max": 50 } }
  ]
}
```

---

### `number`
- Required: `type`, `key`, `label`
- Optional: `outputPath`, `props.decimal`, `props.numberAsString`, `props.prefix`, `props.colWidth`, `props.hiddenComponent`, `props.allowNull`, `displayConditions`, `validators`
- Forbidden: `options`, `defaultValue` (not allowed for number)

```json
{
  "key": "age",
  "type": "number",
  "label": "Age *",
  "outputPath": "spouse.age",
  "props": {
    "decimal": false
  },
  "validators": [
    { "validation": { "type": "required" } },
    { "validation": { "type": "greaterThanEqualsToNumber", "min": 18 } },
    { "validation": { "type": "lessThanEqualsToNumber", "max": 70 } }
  ]
}
```

---

### `currency`
- Required: `type`, `key`, `label`
- Optional: `outputPath`, `props.prefix`, `props.colWidth`, `props.hiddenComponent`, `props.allowNull`, `displayConditions`, `validators`
- Forbidden: `options`, `defaultValue`

```json
{
  "key": "cover_amount",
  "type": "currency",
  "label": "Cover amount *",
  "outputPath": "cover_amount",
  "props": {
    "prefix": "R"
  },
  "validators": [
    { "validation": { "type": "required" } },
    { "validation": { "type": "greaterThanEqualsToCurrency", "min": 0 } },
    { "validation": { "type": "lessThanEqualsToCurrency", "max": 10000000 } }
  ]
}
```

---

### `number-slider`
- Required: `type`, `key`, `label`
- Optional: `outputPath`, `props.increment`, `props.prefix`, `displayConditions`, `validators`
- Validators: uses **number validators** (`greaterThanNumber`, etc.)

```json
{
  "key": "years_insured",
  "type": "number-slider",
  "label": "Years insured *",
  "outputPath": "years_insured",
  "props": {
    "increment": 1,
    "prefix": ""
  },
  "validators": [
    { "validation": { "type": "required" } },
    { "validation": { "type": "greaterThanEqualsToNumber", "min": 0 } },
    { "validation": { "type": "lessThanEqualsToNumber", "max": 50 } }
  ]
}
```

---

### `currency-slider`
- Required: `type`, `key`, `label`
- Optional: `outputPath`, `props.increment`, `props.prefix`, `displayConditions`, `validators`
- Validators: uses **currency validators** (`greaterThanCurrency`, etc.) with cents.

```json
{
  "key": "monthly_premium",
  "type": "currency-slider",
  "label": "Monthly premium *",
  "outputPath": "monthly_premium",
  "props": {
    "prefix": "R",
    "increment": 500
  },
  "validators": [
    { "validation": { "type": "required" } },
    { "validation": { "type": "greaterThanEqualsToCurrency", "min": 5000 } },
    { "validation": { "type": "lessThanEqualsToCurrency", "max": 500000 } }
  ]
}
```

---

### `select`
- Required: `type`, `key`, `label`, `options`
- Optional: `outputPath`, `displayConditions`, `validators`, `datastore`
- Forbidden: `defaultValue` (not allowed by schema for select)

```json
{
  "key": "gender",
  "type": "select",
  "label": "Gender *",
  "outputPath": "spouse.gender",
  "options": [
    { "label": "Male", "value": "male" },
    { "label": "Female", "value": "female" }
  ],
  "validators": [
    { "validation": { "type": "required" } }
  ]
}
```

---

### `country`
- Same structural rules as `select` (requires `options` or `datastore` depending on usage; per schema, `options` is not required for country explicitly unless used as select-like; but validators branch includes `country`).
- If you include `options`, it must match select option shape.

```json
{
  "key": "country_of_birth",
  "type": "country",
  "label": "Country of birth *",
  "outputPath": "country_of_birth",
  "options": [
    { "label": "South Africa", "value": "ZA" },
    { "label": "Namibia", "value": "NA" }
  ],
  "validators": [
    { "validation": { "type": "required" } }
  ]
}
```

---

### `date-picker`
- Required: `type`, `key`, `label`
- Optional: `outputPath`, `displayConditions`, `validators`

```json
{
  "key": "date_of_birth",
  "type": "date-picker",
  "label": "Date of birth *",
  "outputPath": "spouse.date_of_birth",
  "validators": [
    { "validation": { "type": "required" } }
  ]
}
```

---

### `cellphone`
- Required: `type`, `key`, `label`
- Optional: `outputPath`, `displayConditions`, `validators`

```json
{
  "key": "cellphone_number",
  "type": "cellphone",
  "label": "Cellphone number *",
  "outputPath": "cellphone_number",
  "validators": [
    { "validation": { "type": "required" } },
    { "validation": { "type": "lessThanEqualsToLength", "max": 20 } }
  ]
}
```

---

### `checkbox`
- Required: `type`, `key`, `label`
- Optional: `outputPath`, `defaultValue` (string|boolean), `displayConditions`, `validators`

```json
{
  "key": "spouse_included",
  "type": "checkbox",
  "label": "Include spouse",
  "outputPath": "spouse_included",
  "defaultValue": false,
  "validators": [
    { "validation": { "type": "required" } }
  ]
}
```

---

### `checkbox-button`
- Required: `type`, `key`, `label`, `options` (exactly 2 boolean options)
- Optional: `outputPath`, `displayConditions`, `validators`
- Note: options `value` must be **boolean** and **strict**

```json
{
  "key": "marketing_opt_in",
  "type": "checkbox-button",
  "label": "Receive marketing messages? *",
  "outputPath": "marketing_opt_in",
  "options": [
    { "label": "Yes", "value": true },
    { "label": "No", "value": false }
  ],
  "validators": [
    { "validation": { "type": "required" } }
  ]
}
```

---

### `radio`
- Required: `type`, `key`, `label`, `options`
- Optional: `outputPath`, `displayConditions`, `validators`

```json
{
  "key": "smoker",
  "type": "radio",
  "label": "Do you smoke? *",
  "outputPath": "smoker",
  "options": [
    { "label": "Yes", "value": true },
    { "label": "No", "value": false }
  ],
  "validators": [
    { "validation": { "type": "required" } }
  ]
}
```

---

### `radio-button`
- Required: `type`, `key`, `label`, `options`
- Optional: `outputPath`, `displayConditions`, `validators`

```json
{
  "key": "payment_frequency",
  "type": "radio-button",
  "label": "Payment frequency *",
  "outputPath": "payment_frequency",
  "options": [
    { "label": "Monthly", "value": "monthly" },
    { "label": "Annually", "value": "annually" }
  ],
  "validators": [
    { "validation": { "type": "required" } }
  ]
}
```

---

### `multiple-checkbox`
- Required: `type`, `key`, `label`, `options`
- Optional: `outputPath`, `defaultValue` (object), `displayConditions`, `validators`

```json
{
  "key": "benefits_selected",
  "type": "multiple-checkbox",
  "label": "Select benefits",
  "outputPath": "benefits_selected",
  "options": [
    { "label": "Accidental death", "value": "accidental_death" },
    { "label": "Disability", "value": "disability" }
  ],
  "defaultValue": {
    "accidental_death": true
  },
  "validators": [
    { "validation": { "type": "required" } }
  ]
}
```

---

### `object`
- Required: `type`, `key`, `label`
- Optional: `outputPath`, `displayConditions`
- Validators: **not allowed** (will be forbidden by schema)

```json
{
  "key": "additional_details",
  "type": "object",
  "label": "Additional details",
  "outputPath": "additional_details"
}
```

---

### `list`
- Required: `type`, `label`, `outputPathList`, `maxNumber`, `components`
- Optional: `minNumber`, `props.addButtonLabel`, `props.removeButtonLabel`, `props.arrayValues`, `outputPathAppendTo`, `displayConditions`, `validators` (note: list *can* have validators per schema branch), `showAddSubtractInApplicationStep`
- `key` is **not defined as required** for list (and often omitted in examples)

```json
{
  "type": "list",
  "label": "Children",
  "outputPathList": "children",
  "maxNumber": 20,
  "props": {
    "addButtonLabel": "Add child",
    "removeButtonLabel": "Remove child"
  },
  "components": [
    {
      "type": "section-header",
      "key": "child_header",
      "label": "Child details",
      "props": {
        "headingTag": "h6",
        "indexNumber": true
      }
    },
    {
      "key": "first_name",
      "type": "text",
      "label": "First name *",
      "outputPath": "children",
      "validators": [
        { "validation": { "type": "required" } }
      ]
    },
    {
      "key": "age",
      "type": "number",
      "label": "Age *",
      "outputPath": "children",
      "validators": [
        { "validation": { "type": "required" } },
        { "validation": { "type": "greaterThanEqualsToNumber", "min": 0 } },
        { "validation": { "type": "lessThanEqualsToNumber", "max": 21 } }
      ]
    }
  ]
}
```

---

## 4) Validators Reference (ALL valid types, correct structure)

All validators are in the form:

```json
{ "validation": { "type": "required" } }
```

### 4.1 Text-like validators (`text`, `select`, `country`, `date-picker`, `cellphone`, `radio`, `radio-button`, `list`)
Allowed `type` values:
- `za_id`
- `email`
- `required`
- `lessThanLength` (requires `max`)
- `lessThanEqualsToLength` (requires `max`)
- `greaterThanLength` (requires `min`)
- `greaterThanEqualsToLength` (requires `min`)
- `imei`

Examples:

```json
[
  { "validation": { "type": "required" } },
  { "validation": { "type": "email" } },
  { "validation": { "type": "greaterThanEqualsToLength", "min": 2 } },
  { "validation": { "type": "lessThanEqualsToLength", "max": 50 } }
]
```

### 4.2 Number validators (`number`, `number-slider`)
Allowed `type` values:
- `greaterThanNumber` (requires `min`)
- `greaterThanEqualsToNumber` (requires `min`)
- `lessThanNumber` (requires `max`)
- `lessThanEqualsToNumber` (requires `max`)
- `imei`
- `required`

Example:

```json
[
  { "validation": { "type": "required" } },
  { "validation": { "type": "greaterThanEqualsToNumber", "min": 18 } },
  { "validation": { "type": "lessThanEqualsToNumber", "max": 70 } }
]
```

### 4.3 Currency validators (`currency`, `currency-slider`) — cents
Allowed `type` values:
- `za_id`
- `greaterThanCurrency` (requires `min`)
- `greaterThanEqualsToCurrency` (requires `min`)
- `lessThanCurrency` (requires `max`)
- `lessThanEqualsToCurrency` (requires `max`)
- `greaterThanLength` (requires `min`)
- `greaterThanEqualsToLength` (requires `min`)
- `lessThanLength` (requires `max`)
- `lessThanEqualsToLength` (requires `max`)
- `imei`
- `required`

Example:

```json
[
  { "validation": { "type": "required" } },
  { "validation": { "type": "greaterThanCurrency", "min": 500000 } },
  { "validation": { "type": "lessThanCurrency", "max": 10000000 } }
]
```

### 4.4 Checkbox validators (`checkbox`, `checkbox-button`)
Allowed `type` values:
- `required`
- `equals` (requires boolean `value`)

Example:

```json
[
  { "validation": { "type": "required" } },
  { "validation": { "type": "equals", "value": true } }
]
```

### 4.5 Multiple-checkbox validators (`multiple-checkbox`)
Allowed `type` values:
- `required`
- `equals` (requires **object** `value`)

Example:

```json
[
  { "validation": { "type": "required" } },
  { "validation": { "type": "equals", "value": { "accidental_death": true } } }
]
```

---

## 5) Display Conditions (show/hide rules)

`displayConditions` is an **array** of condition objects.

Each condition object:
- `path` (string, required)
- `condition` one of: `===`, `!==`, `>=`, `<=`
- `value`:
  - if `condition` is `>=` or `<=` → must be **number**
  - otherwise → string (including empty string), number, boolean, or null

Supports nested logic:
- top-level objects can include `and: [...]` and/or `or: [...]`
- nested `and/or` items can themselves include `and/or` one level deeper.

Simple example:

```json
"displayConditions": [
  { "path": "spouse_included", "condition": "===", "value": true }
]
```

AND/OR example:

```json
"displayConditions": [
  {
    "path": "spouse_included",
    "condition": "===",
    "value": true,
    "and": [
      { "path": "age", "condition": ">=", "value": 18 }
    ]
  }
]
```

---

## 6) List Components (structure + nesting)

### Required list fields
- `type: "list"`
- `label`
- `outputPathList` (required)
- `maxNumber` (required, integer >= 1)
- `components` (required array)

### List-within-list
Allowed: a list component can contain components, and among them can be another `list` with its own `components`. Deeper than that is not validated.

Nested list example (2 levels):

```json
{
  "type": "list",
  "label": "Households",
  "outputPathList": "households",
  "maxNumber": 20,
  "components": [
    {
      "key": "household_name",
      "type": "text",
      "label": "Household name *",
      "outputPath": "households",
      "validators": [
        { "validation": { "type": "required" } }
      ]
    },
    {
      "type": "list",
      "label": "Members",
      "outputPathList": "members",
      "maxNumber": 20,
      "components": [
        {
          "key": "first_name",
          "type": "text",
          "label": "First name *",
          "outputPath": "members",
          "validators": [
            { "validation": { "type": "required" } }
          ]
        }
      ]
    }
  ]
}
```

---

## 7) Application Schema specifics (from your context)

Application schemas should:
- **Extend, don’t replace** quote data structures
- Use `displayConditions` keyed off quote fields (e.g., `spouse_included === true`)
- Keep `outputPath` aligned with quote structure (e.g., `spouse.first_name` goes into the same `spouse` object that quote created)

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
| length | Wrong property name | Use `min` or `max` |
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
{
  "key": "email",
  "type": "text",
  "label": "Email",
  "description": "Enter email",
  "validators": [{ "validation": { "type": "required" }, "errorMessage": "Required" }]
}
```

CORRECT - No forbidden properties:
```json
{
  "key": "email",
  "type": "text",
  "label": "Email *",
  "outputPath": "email",
  "validators": [
    { "validation": { "type": "required" } },
    { "validation": { "type": "email" } }
  ]
}
```

WRONG - Using invalid validator:
```json
{
  "validators": [{ "validation": { "type": "range", "minValue": 18, "maxValue": 65 } }]
}
```

CORRECT - Using valid validators:
```json
{
  "validators": [
    { "validation": { "type": "greaterThanEqualsToNumber", "min": 18 } },
    { "validation": { "type": "lessThanEqualsToNumber", "max": 65 } }
  ]
}
```

### Additional anti-patterns directly implied by the Joi schema
- Putting `outputPath` on `section-header` / `paragraph` / `horizontal-line` → **fails** (`outputPath` is forbidden for those types).
- Adding `options` to `text`, `number`, `currency`, `date-picker`, `checkbox` → **fails** (`options` is only allowed for `select`, `radio`, `radio-button`, `multiple-checkbox`, `checkbox-button`).
- Adding `defaultValue` to `select` / `radio` / `radio-button` / `number` / `currency` → **fails** (defaultValue is only allowed for `checkbox` and `multiple-checkbox`).
- Using `props.increment` on anything other than `currency-slider` / `number-slider` → **fails**.
- Using `props.decimal` or `props.numberAsString` on anything other than `number` → **fails**.
- Using `props.indexNumber` on anything other than `section-header` → **fails**.
- Omitting `outputPathList` or `maxNumber` on a `list` → **fails**.

---

## 9) Complete Examples

### 9.1 Minimal “application step” extension example (spouse details shown only if quote included spouse)

```json
[
  {
    "type": "section-header",
    "key": "spouse_header",
    "label": "Spouse",
    "props": { "headingTag": "h5", "fontWeight": "bold" },
    "displayConditions": [
      { "path": "spouse_included", "condition": "===", "value": true }
    ]
  },
  {
    "key": "first_name",
    "type": "text",
    "label": "First name *",
    "outputPath": "spouse.first_name",
    "displayConditions": [
      { "path": "spouse_included", "condition": "===", "value": true }
    ],
    "validators": [
      { "validation": { "type": "required" } }
    ]
  },
  {
    "key": "last_name",
    "type": "text",
    "label": "Last name *",
    "outputPath": "spouse.last_name",
    "displayConditions": [
      { "path": "spouse_included", "condition": "===", "value": true }
    ],
    "validators": [
      { "validation": { "type": "required" } }
    ]
  },
  {
    "key": "date_of_birth",
    "type": "date-picker",
    "label": "Date of birth *",
    "outputPath": "spouse.date_of_birth",
    "displayConditions": [
      { "path": "spouse_included", "condition": "===", "value": true }
    ],
    "validators": [
      { "validation": { "type": "required" } }
    ]
  }
]
```

### 9.2 List-based application extension example (children)

```json
[
  {
    "type": "section-header",
    "key": "children_header",
    "label": "Children",
    "props": { "headingTag": "h5", "fontWeight": "bold" },
    "displayConditions": [
      { "path": "children_included", "condition": "===", "value": true }
    ]
  },
  {
    "type": "list",
    "label": "List",
    "outputPathList": "children",
    "maxNumber": 20,
    "props": { "addButtonLabel": "Add child" },
    "displayConditions": [
      { "path": "children_included", "condition": "===", "value": true }
    ],
    "components": [
      {
        "type": "section-header",
        "key": "child_details_header",
        "label": "Details of child",
        "props": { "headingTag": "h5", "indexNumber": true }
      },
      {
        "key": "first_name",
        "type": "text",
        "label": "First name *",
        "outputPath": "children",
        "validators": [
          { "validation": { "type": "required" } }
        ]
      },
      {
        "key": "last_name",
        "type": "text",
        "label": "Last name *",
        "outputPath": "children",
        "validators": [
          { "validation": { "type": "required" } }
        ]
      },
      {
        "key": "date_of_birth",
        "type": "date-picker",
        "label": "Date of birth *",
        "outputPath": "children",
        "validators": [
          { "validation": { "type": "required" } }
        ]
      }
    ]
  }
]
```
