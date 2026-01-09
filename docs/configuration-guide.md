# Configuration Guide (.root-config.json)

**CRITICAL**: When you add a new alteration hook, scheduled function, or fulfillment type, you MUST update `.root-config.json`.

### 1. CRITICAL: Updating .root-config.json
When making changes to a product module, you MUST update the .root-config.json file accordingly:

### 1. Adding Alteration Hooks

When you create a new alteration hook, you MUST:
1. Create the schema file: `workflows/alteration-hooks/{hook_key}.json`
2. Add the hook functions in `code/main.js`:
   - `validate{HookName}AlterationHookRequest()`
   - `get{HookName}Alteration()`
   - `apply{HookName}Alteration()`
3. **MUST** register in `.root-config.json`:

```json
{
  "alterationHooks": [
    { "key": "existing_hook", "name": "Existing Hook" },
    { "key": "your_new_hook", "name": "Your New Hook" }
  ]
}
```

### 2. Adding Scheduled Functions

When you create a new scheduled function, you MUST:
1. Add the function in `code/main.js`
2. **MUST** register in `.root-config.json`:

```json
{
  "scheduledFunctions": [
    {
      "functionName": "applyAnnualIncrease",
      "policyStatuses": ["active", "lapsed"],
      "frequency": {
        "type": "yearly",
        "timeOfDay": "04:00",
        "dayOfMonth": 1,
        "monthOfYear": "january"
      }
    }
  ]
}
```

### 3. Adding Fulfillment Types

When you add a new fulfillment type, you MUST register in `.root-config.json`:

```json
{
  "fulfillmentTypes": [
    {
      "key": "bank_transfer",
      "label": "Bank Transfer",
      "fulfillmentData": {
        "account_number": { "label": "Account Number", "valueType": "string" },
        "bank_name": { "label": "Bank Name", "valueType": "string" }
      }
    }
  ]
}
```

---

### 2. .root-config.json Top-Level Structure
```json
{
  "settings": { ... },
  "alterationHooks": [...],
  "scheduledFunctions": [...],
  "fulfillmentTypes": [...]
}
```

Common full-file shape (top-level keys that may appear):
- `$schema` (string): schema URL
- `productModuleName` (string)
- `productModuleKey` (string)
- `organizationId` (string, UUID)
- `host` (string, URL)
- `stack` (string, deprecated)
- `codeFileOrder` (array of strings)
- `settings` (object, required)
- `alterationHooks` (array)
- `scheduledFunctions` (array, required by schema)
- `fulfillmentTypes` (array, required by schema)

Validation rules:
- Do not add properties not defined by the schema (`additionalProperties: false` in multiple objects).
- `settings`, `scheduledFunctions`, `fulfillmentTypes` are required at root level.

---

### 3. Settings Reference

`settings` (object) contains **general settings** and nested **billing** settings.

#### General Settings

**Hooks and features**
- `policySchemeType` (string, required): Product scheme type.  
  Valid values: `"individual" | "group"`.
- `dashboardIssuingEnabled` (boolean, required): Whether policies can be issued via the dashboard issuing flow.
- `overridePolicyModuleDataDisplay` (boolean, optional): If true, dashboard policy module display data can be controlled via code function `getPolicyModuleDisplayData`.
- `activatePoliciesOnEvent` (string, required): Event that activates a policy.  
  Valid values: `"policy_issued" | "payment_method_assigned" | "first_successful_payment" | "none"`.
- `canReactivatePolicies` (boolean, required): Whether inactive policies can be reactivated (status to `active`).
- `canRequote` (boolean, required, **deprecated**): Legacy requote feature flag (superseded by alteration hooks).
- `policyNumberSchema` (object | null, optional): Custom policy number format. If `null`, defaults apply (platform default described in source).  
  Properties (required: `characterSet`, `length`):
  - `characterSet` (string): Allowed characters.
  - `length` (integer, min 1): Length of generated number.
  - `prefix` (string, optional)
  - `suffix` (string, optional)

Example:
```json
{
  "settings": {
    "policyNumberSchema": {
      "characterSet": "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "length": 10,
      "prefix": "",
      "suffix": ""
    }
  }
}
```

- `defaultStatus` (string, optional): Default status before activation.  
  Valid values: `"pending" | "pending_initial_payment"`.

**Not Taken Up (NTU) / Prevent lapse & NTU**
- `notTakenUpEnabled` (boolean) **or**
- `notTakenUp` (object)

Constraint: `settings` must include **either** `notTakenUpEnabled` **or** `notTakenUp` (`oneOf` requirement).

`notTakenUp` (object, required if used; additionalProperties false):
- `enabled` (boolean, required): Enables NTU logic.
- `failedPaymentsBeforeNTU` (integer, min 1, required): Failures/reversals before status becomes `not_taken_up`.

Example:
```json
{
  "settings": {
    "notTakenUp": {
      "enabled": true,
      "failedPaymentsBeforeNTU": 1
    }
  }
}
```

- `preventPolicyLapseAndNTU` (boolean, optional): Enables dashboard action to pause lapse/NTU for a period.

**Policyholder Settings**
- `policyholder` (object, required; additionalProperties false)

Properties (required: `individualsAllowed`, `individualsIdAllowed`, `individualsPassportAllowed`, `companiesAllowed`):
- `companiesAllowed` (boolean): Legal persons allowed.
- `individualsAllowed` (boolean): Individuals allowed.  
  Relationship rule (documented): if `true`, one or more of `individualsIdAllowed` and `individualsPassportAllowed` must be `true`.
- `individualsIdAllowed` (boolean): ID number allowed as unique identifier.
- `individualsPassportAllowed` (boolean): Passport allowed as unique identifier.
- `individualsEmailAllowed` (boolean, optional in schema): Email allowed as unique identifier.
- `individualsCellphoneAllowed` (boolean, optional in schema): Cellphone allowed as unique identifier.
- `individualsCustomIdAllowed` (boolean, optional in schema): Custom identifier allowed.
- `customIdName` (string, optional): Label shown in dashboard for custom identifier.
- `idCountry` (string, optional): ISO alpha-2 country code used to prefill dashboard inputs.
- `individualPolicyholderFields` (object, optional): Controls required/hidden fields for individual policyholders (dashboard issuing + embed flows).

`individualPolicyholderFields` (object; additionalProperties false). Supported sub-objects:
- `dateOfBirth` (object):
  - `hidden` (boolean, optional)
  - `required` (boolean, required if `dateOfBirth` provided)
- `gender` (object):
  - `hidden` (boolean, required if `gender` provided)
- `address` (object):
  - `suburb` (object):
    - `required` (boolean, required if `suburb` provided)
- `email` (object):
  - `required` (boolean)

Example:
```json
{
  "settings": {
    "policyholder": {
      "companiesAllowed": false,
      "individualsAllowed": true,
      "individualsIdAllowed": true,
      "individualsPassportAllowed": true,
      "individualsCellphoneAllowed": true,
      "individualsEmailAllowed": true,
      "individualsCustomIdAllowed": true,
      "customIdName": "UK Driving License",
      "idCountry": "GB",
      "individualPolicyholderFields": {
        "address": { "suburb": { "required": true } },
        "dateOfBirth": { "required": true },
        "gender": { "hidden": true }
      }
    }
  }
}
```

**Beneficiaries**
- `beneficiaries` (object | null, required): Enables/disables beneficiaries. If `null`, beneficiaries disabled.

If object (required: `makePolicyholderABeneficiary`, `min`, `max`; additionalProperties false):
- `makePolicyholderABeneficiary` (boolean): Auto-add policyholder as first beneficiary.
- `min` (integer, min 0): Minimum beneficiaries required.
- `max` (integer, min 0): Maximum beneficiaries allowed.
- `individualBeneficiaryFields` (object, optional): Field display/required options:
  - `dateOfBirth.required` (boolean)
  - `address.displayAddress` (boolean)

Example:
```json
{
  "settings": {
    "beneficiaries": {
      "makePolicyholderABeneficiary": true,
      "min": 1,
      "max": 2,
      "individualBeneficiaryFields": {
        "address": { "displayAddress": false },
        "dateOfBirth": { "required": true }
      }
    }
  }
}
```

**Policy documents**
- `welcomeLetterEnabled` (boolean, required): Whether welcome letter is generated/sent.
- `policyAnniversaryNotification` (object | null, required): Anniversary notification config; set to `null` to disable.  
  If object:  
  - `daysBeforeToSend` (integer, min 0, required)

- `policyDocuments` (array, optional): Policy document config list.

Each item is one of:

1) Base document config (object):
- `type` (string, required):  
  Valid values: `"policy_anniversary" | "welcome_letter" | "policy_schedule" | "terms"`
- `fileName` (string, optional): Custom filename (no extension; handlebars allowed)

2) Certificate config (object):
- `type` = `"certificate"`
- `enabled` (boolean, required): Must be present only for certificate type.
- `fileName` (string, optional)

3) Supplementary terms config (object):
- `type` = `"supplementary_terms"`
- `fileName` (string, required)
- `supplementaryTermsType` (string, required, maxLength 100): Must match PDF filename in supplementary terms store (without extension).

Example:
```json
{
  "settings": {
    "policyDocuments": [
      { "type": "terms", "fileName": "{{ policyholder.first_name }}_terms" },
      { "type": "certificate", "fileName": "{{ policyholder.first_name }}_certificate", "enabled": true },
      {
        "type": "supplementary_terms",
        "supplementaryTermsType": "additional-terms-and-conditions",
        "fileName": "{{ policyholder.first_name }}_additional_terms_and_conditions"
      }
    ],
    "policyAnniversaryNotification": { "daysBeforeToSend": 30 },
    "welcomeLetterEnabled": true
  }
}
```

**Policy lifecycle settings**
- `gracePeriod` (object, required)
  - `lapseOn` (object, required): Lapse rules; each rule is an object or null.
    - `afterFirstMissedPayment` (object | null):
      - `period` (integer, min 0)
      - `periodType` (string): `"days" | "months" | "years"`
    - `consecutiveMissedPayments` (object | null):
      - `number` (integer, min 1)
    - `missedPaymentsOverPolicyTerm` (object | null):
      - `number` (integer, min 1)
    - `missedPaymentsWithinPeriod` (object | null):
      - `number` (integer, min 1)
      - `period` (integer, min 1)
      - `periodType` (string): `"days" | "months" | "years"`
  - `lapseExclusionRules` (object, optional in schema but present in examples): Conditions that can prevent lapsing.
    - `lapsePolicyWithProcessingPayment` (boolean, required by schema; note described default behavior is effectively false if unset in some contexts)
    - `arrearsThreshold` (object, optional):
      - `enabled` (boolean)
      - `thresholdInCents` (string): either digits (positive cents) or `"policy_premium"`
    - `excludeArrearsFromLapseCalculation` (boolean, optional): If true, arrears payments don’t count toward lapse/NTU calculations.

Example:
```json
{
  "settings": {
    "gracePeriod": {
      "lapseOn": {
        "afterFirstMissedPayment": { "period": 15, "periodType": "days" },
        "consecutiveMissedPayments": { "number": 5 },
        "missedPaymentsOverPolicyTerm": { "number": 10 },
        "missedPaymentsWithinPeriod": { "number": 6, "period": 12, "periodType": "months" }
      },
      "lapseExclusionRules": {
        "lapsePolicyWithProcessingPayment": false,
        "arrearsThreshold": { "enabled": false, "thresholdInCents": "1000" },
        "excludeArrearsFromLapseCalculation": false
      }
    }
  }
}
```

- `waitingPeriod` (object, required): Claims warning waiting period setting (schema notes it’s not well supported; recommended to disable).
  - `applyTo` (object, required):
    - `theFullPolicy` (object | null, required): set to `null` to disable
      - `period` (integer, min 0)
      - `periodType` (string): `"days" | "months" | "years"`

- `coolingOffPeriod` (object, required):
  - `applyTo` (object, required):
    - `theFullPolicy` (object | null, required): set to `null` to disable
      - `period` (integer, min 0)
      - `periodType` (string): `"days" | "months" | "years"`
      - `refundType` (string, required): must be `"all_premiums"`

**Claims settings**
- `claims` (object, required; additionalProperties false)
  - `documentLabels` (array of strings, required): Labels for uploaded claim docs.
  - `checklistItems` (array of strings, required): Yes/no checklist items for assessors.
  - `claimAssignmentMethod` (string, optional): Assignment method.  
    Valid values: `"round_robin" | "manual" | "product_module"`
  - `enableClaimAssignments` (boolean, optional): Enable/disable claim assignment flows.
  - `enableLegacyClaimsSchema` (boolean, optional): Legacy claims schema support.
  - `annuityTypes` (array, optional/empty array in schema)

**Deprecated settings (do not implement in new modules)**
- `coveredItems` (object): deprecated
- `coveredPeople` (object): deprecated
(Deprecated settings exist; do not detail beyond acknowledging.)

---

#### Billing Settings (`settings.billing`)

`billing` (object, required; additionalProperties false)

Required properties:
- `billBeforeWeekendEnabled` (boolean): If true, when billing date falls on Sunday/public holiday, action on last process day before (relevant for debit orders & external).
- `billingFrequency` (string): Default billing frequency.  
  Valid values: `"monthly" | "yearly" | "weekly" | "daily" | "once_off"`.
- `clientStatementReference` (string): Debit order statement prefix (max 10 chars per docs; schema doesn’t enforce length).
- `currency` (string): ISO 4217 currency code. (Schema enumerates all ISO codes.)
- `paymentSubmissionLeadTime` (integer, min 0): Days earlier than default submission date.
- `proRataBilling` (object): Pro-rata billing config (required)
  - `enabled` (boolean)
  - `proRataBillingOnIssue` (boolean)
  - `minimumAmount` (integer, min 0, **deprecated**; recommended `0`)
- `paymentMethodTypes` (object): Which payment methods are enabled (required)
- `retryFailedPayments` (object): Retry configuration (required)

Optional properties:
- `consecutiveFailedPaymentsAllowed` (integer, min 0): Default is 4 if not set (per docs).
- `allowStartDateChange` (boolean): Enables dashboard flow for start date changes (incl past/after start).
- `enableBillingOnSandbox` (boolean): Enables limited billing operations on sandbox.
- `disableDebitPremiums` (boolean): If true, don’t debit premiums on schedule.
- `disableBillingDayAdjustments` (object):
  - `enabled` (boolean, required)
- `alwaysChargeMonthlyPremium` (object):
  - `enabled` (boolean, required)
- `minimumPaymentAmount` (object):
  - `enabled` (boolean, required)
  - `amountInCents` (number, optional; docs mention default 1000 cents)
- `combineProRataAndPremium` (object, optional):
  - `enabled` (boolean)
  - `daysBeforeBilling` (number) (docs: default enabled true, 5 days)
- `doNotBlockPaymentMethodFailureCodes` (object):
  - `enabled` (boolean, required)
  - `codes` (array of strings, optional)

##### `billing.retryFailedPayments`
- `enabled` (boolean, required)
- `daysBetweenRetries` (number, required)
- `numberOfRetries` (number, required)

Example:
```json
{
  "settings": {
    "billing": {
      "retryFailedPayments": { "enabled": true, "daysBetweenRetries": 5, "numberOfRetries": 2 }
    }
  }
}
```

##### `billing.paymentMethodTypes`
Object with required keys: `debitOrders`, `card`, `eft`, `external`. Also supports `collectionModules` (array) in the modern schema; legacy `collectionModule` exists (deprecated).

**debitOrders** (object; required fields: `enabled`, `naedoPoliciesInArrears`, `strategy`)
- `enabled` (boolean)
- `naedoPoliciesInArrears` (boolean)
- `strategy` (string | null):  
  Valid values: `"two_day" | "same_day" | "naedo" | "debicheck" | "best_effort" | null`
- `assumeSuccess` (object, optional; feature-flag dependent):
  - `enabled` (boolean, required)
  - `daysAfterPaymentDate` (integer, min 1, optional)
- `disablePaymentCreationForKeys` (array of strings, optional; feature-flag dependent)

**card** (object)
- `enabled` (boolean)
- `assumeSuccess` (object, optional)

**eft** (object)
- `enabled` (boolean)
- `assumeSuccess` (object, optional)

**external** (object; required: `enabled`, `createPayments`)
- `enabled` (boolean)
- `createPayments` (boolean)
- `assumeSuccess` (object, optional)
- `disablePaymentCreationForKeys` (array of strings, optional)

**collectionModules** (array of objects, optional)
- item:
  - `key` (string): Collection module key to enable

Example:
```json
{
  "settings": {
    "billing": {
      "paymentMethodTypes": {
        "debitOrders": { "enabled": true, "naedoPoliciesInArrears": true, "strategy": "best_effort" },
        "card": { "enabled": false },
        "eft": { "enabled": false },
        "external": { "enabled": false, "createPayments": false },
        "collectionModules": [{ "key": "some_collection_module" }]
      }
    }
  }
}
```

Feature-flag notes (behavioral dependency):
- `assumeSuccess` is only used if the feature flag `use_assume_success_setting` is enabled; otherwise it is ignored and the system assumes success.
- `minimumPaymentAmount`, `doNotBlockPaymentMethodFailureCodes`, `disablePaymentCreationForKeys` (external/debit orders), `disableBillingDayAdjustments`, `alwaysChargeMonthlyPremium` are also feature-flag gated in platform code; config may be added/removed depending on enabled flags.

---

### 4. Alteration Hooks Configuration

Register alteration hooks in `.root-config.json`:

- `alterationHooks` (array of objects):
  - `key` (string): Hook key; must correspond to schema file name and workflow key.
  - `name` (string): Human-readable name.

Example:
```json
{
  "alterationHooks": [
    { "key": "change_start_date", "name": "Change Start Date" }
  ]
}
```

Required accompanying module changes (from critical section):
- Add `workflows/alteration-hooks/{hook_key}.json`
- Add functions in `code/main.js`:
  - `validate{HookName}AlterationHookRequest()`
  - `get{HookName}Alteration()`
  - `apply{HookName}Alteration()`

---

### 5. Scheduled Functions Configuration

Register scheduled functions in `.root-config.json`:

- `scheduledFunctions` (array of objects; required at top-level)
  - `functionName` (string, required): Must match a function implemented in `code/main.js`.
  - `policyStatuses` (array of strings, required, minItems 1): Statuses to run against.  
    Valid values:  
    `"pending_initial_payment" | "pending" | "not_taken_up" | "cancelled" | "active" | "lapsed" | "expired"`
  - `frequency` (object, required): One of the frequency types below.

**Frequency object**
- Common:
  - `type` (string): `"daily" | "weekly" | "monthly" | "yearly"`
  - `timeOfDay` (string): must match `^(?:\d|[01]\d|2[0-3]):[30]0$`  
    (HH:00 or HH:30 only)

- Daily:
  - `type`: `"daily"`
  - `timeOfDay`

- Weekly:
  - `type`: `"weekly"`
  - `timeOfDay`
  - `dayOfWeek` (string): `"monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"`

- Monthly:
  - `type`: `"monthly"`
  - `timeOfDay`
  - `dayOfMonth` (number, min 1, max 31)

- Yearly:
  - `type`: `"yearly"`
  - `timeOfDay`
  - `dayOfMonth` (number, min 1, max 31)
  - `monthOfYear` (string): `"january" ... "december"`

Examples:

Daily:
```json
{
  "scheduledFunctions": [
    {
      "functionName": "dailySweep",
      "policyStatuses": ["active"],
      "frequency": { "type": "daily", "timeOfDay": "02:00" }
    }
  ]
}
```

Weekly:
```json
{
  "scheduledFunctions": [
    {
      "functionName": "weeklyReview",
      "policyStatuses": ["active", "lapsed"],
      "frequency": { "type": "weekly", "dayOfWeek": "monday", "timeOfDay": "04:30" }
    }
  ]
}
```

Monthly:
```json
{
  "scheduledFunctions": [
    {
      "functionName": "monthEndProcess",
      "policyStatuses": ["active"],
      "frequency": { "type": "monthly", "dayOfMonth": 1, "timeOfDay": "01:00" }
    }
  ]
}
```

Yearly (same as critical example):
```json
{
  "scheduledFunctions": [
    {
      "functionName": "applyAnnualIncrease",
      "policyStatuses": ["active", "lapsed"],
      "frequency": {
        "type": "yearly",
        "timeOfDay": "04:00",
        "dayOfMonth": 1,
        "monthOfYear": "january"
      }
    }
  ]
}
```

---

### 6. Fulfillment Types Configuration

Register fulfillment types in `.root-config.json`:

- `fulfillmentTypes` (array of objects; required at top-level)
  - `key` (string, required): Fulfillment type key.
  - `label` (string, required): Display label.
  - `fulfillmentData` (object, required): A map of fields; each field value is an object:
    - `label` (string, required)
    - `valueType` (string, required) (e.g. `"string"`, `"enum"`, etc.)
    - `isValue` (boolean, optional)
    - `valueOptions` (object, optional): for enum-like inputs

Example (enum + string):
```json
{
  "fulfillmentTypes": [
    {
      "key": "in_store_account_credit",
      "label": "In-Store Account Credit",
      "fulfillmentData": {
        "credit_amount": {
          "label": "Credit Amount",
          "valueType": "enum",
          "valueOptions": {
            "10000": "R100",
            "20000": "R200"
          }
        },
        "account_id": {
          "label": "Account ID",
          "valueType": "string"
        }
      }
    }
  ]
}
```
