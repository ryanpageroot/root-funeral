# Product Module Code Guide

How to write product module code, event hooks, and lifecycle functions.

## 1. Product Module Code Overview

Product module code is custom JavaScript that runs inside Root’s secured Node.js runtime to implement **product-specific business logic** (pricing, underwriting rules, policy data, post-issue automation, etc.). The platform invokes specific **hook functions** by name when certain events occur:

- **User-initiated API flows**: quote → application → policy issue, plus alterations/reactivation/claims (depending on enabled features).
- **Automated events**: lifecycle hooks (payments, status changes, claim events, etc.).
- **Time-based automation**: scheduled functions configured in `.root-config.json`.

Errors are surfaced by throwing a standard JS error: `throw new Error('message')` (typically becomes a `400 Bad Request` in API-triggered flows).

---

## 2. Available Global Functions / Modules (Global Scope)

### Root-provided constructors (returned objects)
Used as return types from hooks.

- `new QuotePackage(props)`
- `new Application(props)`
- `new Policy(props)`
- `new AlterationPackage(props)`
- `new AlteredPolicy(props)`
- `new ReactivationOption(props)`
- `new RequotePolicy(props)` *(deprecated)*

### Utility globals
- `createUuid(): string` — generates a UUID.

### Dates
- `moment(): Moment` — moment.js (UTC mode)
- `moment(input?: any): Moment`
- `momentTimezone(): MomentTimezone` — moment-timezone entrypoint
- `momentTimezone().tz(timezone: string): Moment`

### Validation
- `Joi` — Joi v11.3.4 with Root extensions:

**Date timezone override**
- `Joi.date(timezone?: string)`
- `Joi.string().isoDate(timezone?: string)`

**Other extensions**
- `Joi.string().idNumber()`
- `Joi.string().imei()`
- `Joi.string().digits()`
- `Joi.string().jsonString()`
- `Joi.string().rfcEmail()`
- `Joi.cellphone()`
- `Joi.dateOfBirth().format(format: string)` *(format optional; default tries `YYYYMMDD` and `YYYY-MM-DD`)*

### HTTP
- `fetch(url: string, options?: object): Promise<Response>` — node-fetch v2.6.0

Helper mentioned in docs examples:
- `checkForAPIErrors({ response }): void` *(used in examples; assume globally available if present in your environment)*

### Built-in JS globals explicitly referenced
- `Math`, `JSON`, `Promise`, `process.env.*`

### Root environment variables
- `process.env.ENVIRONMENT: 'sandbox' | 'production'`
- `process.env.ORGANIZATION_ID: string`
- `process.env.ORGANIZATION_TIMEZONE: string`
- `process.env.API_TOKEN: string`
- `process.env.API_BASE_URL: string`

---

## 3. Quote Hook

### Function signatures
- `validateQuoteRequest(data)`
- `getQuote(data)`

*(Also exists as a supported function name in platform: `describeQuoteRequestSchema()` — see below.)*

### Inputs
**`validateQuoteRequest(data)`**
- `data: object` — quote request payload (product-specific fields + standard `type` is handled by platform).

**`getQuote(data)`**
- `data: object` — validated data returned by `validateQuoteRequest()`.

### Required return structures
**`validateQuoteRequest(data)`**
- Must return a Joi validation result object, typically:
  - `{ error?: any, value?: any }` (exact Joi output)
- Or throw an Error.

**`getQuote(data)`**
- Must return: `QuotePackage[]`

**QuotePackage properties (used in examples)**
- `package_name: string`
- `sum_assured: integer` (cents)
- `base_premium: integer` (cents)
- `suggested_premium: integer` (cents)
- `billing_frequency: 'monthly' | 'yearly'`
- `module: object` (product-specific persisted data)
- `input_data: object` (**must match original quote request payload unchanged** for dashboard compatibility)

### Example
```javascript
const validateQuoteRequest = (data) => {
  return Joi.validate(
    data,
    Joi.object().keys({
      life_cover: Joi.number().integer().min(100000 * 100).max(5000000 * 100).required(),
      age: Joi.number().integer().min(18).max(63).required(),
      smoker: Joi.boolean().required(),
    }).required()
  );
};

const getQuote = (data) => {
  const premium = 12345; // cents

  const quotePackage = new QuotePackage({
    package_name: 'Example package',
    sum_assured: data.life_cover,
    base_premium: premium,
    suggested_premium: premium,
    billing_frequency: 'monthly',
    module: { ...data },
    input_data: { ...data },
  });

  return [quotePackage];
};
```

### Optional schema describer hook (supported by platform)
- `describeQuoteRequestSchema(): Joi.ObjectSchema` — “Returns the Joi validation schema for quote validation”

---

## 4. Application Hook

### Function signatures
- `validateApplicationRequest(data, policyholder, quote_package)`
- `getApplication(data, policyholder, quote_package)`

*(Also exists as supported function name: `describeApplicationRequestSchema()`.)*

### Inputs
**`validateApplicationRequest(data, policyholder, quote_package)`**
- `data: object` — application request payload (must include standard fields in the API layer, e.g. `quote_package_id`, `policyholder_id`; product module receives parsed `data`)
- `policyholder: object`
- `quote_package: QuotePackage`

**`getApplication(data, policyholder, quote_package)`**
- same three parameters; `data` is the validated result from `validateApplicationRequest`.

### Required return structures
**`validateApplicationRequest(...)`**
- returns Joi validation result object (or throws)

**`getApplication(...)`**
- returns `Application`

**Application properties (used in examples)**
- `package_name: string`
- `sum_assured: integer`
- `base_premium: integer`
- `monthly_premium: integer`
- `input_data: object`
- `module: object`

### Example
```javascript
const validateApplicationRequest = (data, policyholder, quote_package) => {
  return Joi.validate(
    data,
    Joi.object().keys({
      referral: Joi.boolean().optional(),
      referrer_member_id: Joi.string().optional(),
    }).required()
  );
};

const getApplication = (data, policyholder, quote_package) => {
  return new Application({
    package_name: quote_package.package_name,
    sum_assured: quote_package.sum_assured,
    base_premium: quote_package.base_premium,
    monthly_premium: quote_package.suggested_premium,
    input_data: { ...data },
    module: {
      ...quote_package.module,
      ...data,
    },
  });
};
```

### Optional schema describer hook (supported by platform)
- `describeApplicationRequestSchema(): Joi.ObjectSchema` — “Returns the Joi validation schema for application validation”

---

## 5. Policy Issue Hook

### Function signature
- `getPolicy(application, policyholder, billing_day)`

### Inputs
- `application: Application`
- `policyholder: object`
- `billing_day: integer` — day of month; defaults to `1` if no payment method assigned at issue.

### Required return structure
Returns `Policy`.

**Policy properties shown in examples**
- `policy_number: string` *(if you generate one; platform also has policy number settings)*
- `package_name: string`
- `sum_assured: integer`
- `base_premium: integer`
- `monthly_premium: integer`
- `start_date: string (ISO 8601)`
- `end_date: string | null`
- `charges: array` *(optional but used for premium breakdown)*
- `module: object`

### Charges array format (saved on policy)
Each entry:
- `type: 'variable' | 'fixed' | 'balance'`
- `name: string`
- `description: string`
- `amount: number` *(required for `variable` and `fixed`; forbidden for `balance`)*

### Example
```javascript
const getPolicy = (application, policyholder, billing_day) => {
  return new Policy({
    policy_number: generatePolicyNumber(),
    package_name: application.package_name,
    sum_assured: application.sum_assured,
    base_premium: application.base_premium,
    monthly_premium: application.monthly_premium,
    start_date: moment().add(1, 'day').format(),
    end_date: moment().endOf('month').add(1, 'year').format(),
    charges: application.module.charges,
    module: { ...application.module },
  });
};
```

---

## 6. Lifecycle Hooks

### General pattern
Each lifecycle hook is a function named exactly as supported by the platform and accepts a **single params object**.

Return:
- `ProductModuleAction[]` or `void` (omit return if no actions)

Throwing:
- Throw `Error` to prevent completion for “before” hooks (e.g. before reactivation, before claim sent to review).

### Supported lifecycle hook function signatures (names + params)

> Base params for most hooks:
- `params.policy: object`
- `params.policyholder: object`

#### Policy status / policy events
- `afterPolicyIssued({ policy, policyholder })`
- `afterPolicyActivated({ policy, policyholder })`
- `afterPolicyNotTakenUp({ policy, policyholder })`
- `afterPolicyLapsed({ policy, policyholder })`
- `afterPolicyCancelled({ policy, policyholder })`
- `afterPolicyExpired({ policy, policyholder })`
- `afterPolicyPaymentMethodAssigned({ policy, policyholder })`

#### Reactivation-related
- `beforePolicyReactivated({ policy, policyholder, reactivationOption })`
- `afterPolicyReactivated({ policy, policyholder, reactivationOption })`

#### Start date change
- `beforePolicyStartDateChanged({ policy, policyholder, billingChange })`
- `afterPolicyStartDateChanged({ policy, policyholder })` *(note: code reference lists base args only)*

`billingChange` properties:
- `start_date: string`
- `billing_day?: number`
- `defer_update: boolean`
- `defer_update_until?: string`
- `billing_month?: number`
- `ledger_adjustments: array` of:
  - `policy_id: string`
  - `organization_id: string`
  - `environment: string`
  - `amount: integer`
  - `description?: string`
  - `currency: string`
  - `balance?: integer`
- `current_balance: number`
- `monthly_premium: number`

#### Alterations
- `afterAlterationPackageApplied({ policy, policyholder, alteration_package, alteration_hook_key })`
  - Note: the function details list `alterationPackage` in one place and docs show `alteration_package`; follow the runtime payload you receive—examples use `alteration_package`.

#### Payments
- `afterPaymentSuccess({ policy, policyholder, payment })`
- `afterPaymentFailed({ policy, policyholder, payment })`
- `afterPaymentReversed({ policy, policyholder, payment })`

#### Payment coupons
- `beforePaymentCouponCreated({ policy, policyholder, newPaymentCoupons, paymentCoupon })`
- `afterPaymentCouponCreated({ policy, policyholder, paymentCoupons, paymentCoupon, newPaymentCoupons })`
- `afterPaymentCouponCancelled({ policy, policyholder, paymentCoupons })`
- `afterPaymentCouponRedeemed({ policy, policyholder, paymentCoupons })`
- `afterPaymentCouponReversed({ policy, policyholder, paymentCoupons })`

#### Claims
- `afterPolicyLinkedToClaim({ policy, policyholder, claim })`
- `afterClaimBlockUpdated({ block_key, policy, policyholder, claim })` *(docs show `block_key` param; code reference’s generic claim args omit it but guide includes it)*
- `beforeClaimSentToReview({ policy, policyholder, claim })`
- `afterClaimSentToReview({ policy, policyholder, claim })`
- `beforeClaimSentToCapture({ policy, policyholder, claim })`
- `afterClaimSentToCapture({ policy, policyholder, claim })`
- `afterClaimDecision({ policy, policyholder })` *(code reference lists base args only; guide says use `claim.approval_status` so expect claim in practice depending on implementation)*
- `afterClaimDecisionAcknowledged({ policy, policyholder })`
- `afterClaimClosed({ policy, policyholder, claim })`
- `afterClaimApproved({ policy, policyholder, claim })`

### Available actions lifecycle hooks can return
See **Actions Reference** below. (All lifecycle hooks use the same action set.)

### Example (activate policy based on billing proximity)
```javascript
const afterPolicyIssued = ({ policy, policyholder }) => {
  const now = moment();
  const dayNumber = now.date();
  const billingDay = policy.billing_day;

  const nextBillingDate =
    billingDay < dayNumber ? now.clone().add(1, 'month').date(billingDay) : now.clone().date(billingDay);

  if (!(nextBillingDate.diff(now, 'days') <= 30)) return;

  return [{ name: 'activate_policy' }];
};
```

---

## 7. Alteration Hooks

### Required setup (schema registration)
You must register alteration hooks in `.root-config.json`:

```json
{
  "alterationHooks": [
    { "key": "add_remove_spouse", "name": "Add / remove spouse" }
  ]
}
```

### Function signatures (core)
All three accept a **single params object**:

- `validateAlterationPackageRequest(params)`
  - `params.alteration_hook_key: string`
  - `params.data: object`
  - `params.policy: object`
  - `params.policyholder: object`

- `getAlteration(params)`
  - `params.alteration_hook_key: string`
  - `params.data: object`
  - `params.policy: object`
  - `params.policyholder: object`

- `applyAlteration(params)`
  - `params.alteration_hook_key: string`
  - `params.policy: object`
  - `params.policyholder: object`
  - `params.alteration_package: AlterationPackage`

### Return structures
- `validateAlterationPackageRequest(...)` → Joi validation result (or throw)
- `getAlteration(...)` → `AlterationPackage`
- `applyAlteration(...)` → `AlteredPolicy`

**AlterationPackage properties**
- `sum_assured: integer`
- `monthly_premium: integer`
- `module: object`
- `input_data: object` *(must equal `data` passed to `getAlteration()` unchanged)*
- `change_description: string`

**AlteredPolicy properties**
- `package_name: string`
- `sum_assured: integer`
- `base_premium: integer`
- `monthly_premium: integer`
- `module: object`
- `start_date?: Date`
- `end_date?: Date`
- `charges?: array`

### Example
```javascript
const validateAlterationPackageRequest = ({ alteration_hook_key, data, policy, policyholder }) => {
  switch (alteration_hook_key) {
    case 'add_remove_spouse':
      return Joi.validate(
        data,
        Joi.object().keys({
          spouse_included: Joi.boolean().required(),
          spouse: Joi.object().keys({
            age: Joi.number().integer().min(18).max(65).required(),
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
          }).when('spouse_included', {
            is: true,
            then: Joi.required(),
            otherwise: Joi.forbidden().allow(null),
          }),
        }).required()
      );
    default:
      throw new Error(`Invalid alteration hook key "${alteration_hook_key}"`);
  }
};

const getAlteration = ({ alteration_hook_key, data, policy, policyholder }) => {
  switch (alteration_hook_key) {
    case 'add_remove_spouse':
      const moduleData = { ...policy.module, ...data }; // example
      return new AlterationPackage({
        input_data: data,
        sum_assured: policy.sum_assured,
        monthly_premium: policy.monthly_premium,
        change_description: 'Alteration - add / remove spouse',
        module: moduleData,
      });
    default:
      throw new Error(`Invalid alteration hook key "${alteration_hook_key}"`);
  }
};

const applyAlteration = ({ alteration_hook_key, policy, policyholder, alteration_package }) => {
  switch (alteration_hook_key) {
    case 'add_remove_spouse':
      return new AlteredPolicy({
        package_name: policy.package_name,
        sum_assured: alteration_package.sum_assured,
        base_premium: alteration_package.monthly_premium,
        monthly_premium: alteration_package.monthly_premium,
        module: alteration_package.module,
        start_date: moment(policy.start_date),
        end_date: moment(policy.end_date),
      });
    default:
      throw new Error(`Invalid alteration hook key "${alteration_hook_key}"`);
  }
};
```

---

## 8. Scheduled Functions

### Configure in `.root-config.json`
```json
{
  "scheduledFunctions": [
    {
      "functionName": "applyAnnualIncrease",
      "policyStatuses": ["active", "lapsed", "cancelled", "expired", "not_taken_up", "pending_initial_payment"],
      "frequency": { "type": "daily", "timeOfDay": "02:00" }
    }
  ]
}
```

**Frequency types**
- `daily` (needs `timeOfDay`)
- `weekly` (needs `dayOfWeek`, `timeOfDay`)
- `monthly` (needs `dayOfMonth`, `timeOfDay`)
- `yearly` (needs `monthOfYear`, `dayOfMonth`, `timeOfDay`)

`timeOfDay` is UTC, at 30-minute intervals.

### Function signature
- `applyAnnualIncrease({ policy, policyholder })`

### Return
- `ProductModuleAction[] | void`

### Example
```javascript
const applyAnnualIncrease = ({ policy, policyholder }) => {
  const newPremium = policy.monthly_premium * 1.1;

  return [
    {
      name: 'update_policy',
      data: { monthlyPremium: newPremium },
    },
  ];
};
```

---

## 9. Actions Reference

Actions are returned by **lifecycle hooks** and **scheduled functions** as an array: `[{ name: ... }, ...]`.

### Action names (exact)
- `activate_policy`
- `lapse_policy`
- `mark_policy_not_taken_up`
- `cancel_policy`
- `update_policy`
- `update_policy_module_data`
- `update_claim_module_data`
- `debit_policy`
- `credit_policy`
- `trigger_custom_notification_event`

### 9.1 Change policy status

#### Activate policy
```javascript
{ name: 'activate_policy' }
```

#### Lapse policy
```javascript
{ name: 'lapse_policy' }
```

#### Mark policy not taken up
```javascript
{ name: 'mark_policy_not_taken_up' }
```

#### Cancel policy
Structure (as executed by platform code):
- `name: 'cancel_policy'`
- `reason: string`
- `cancellation_requestor: string`
- `cancellation_type: string`

```javascript
{
  name: 'cancel_policy',
  reason: '<reason>',
  cancellation_requestor: 'client',
  cancellation_type: 'Alternate product',
}
```

### 9.2 Update policy data

#### Update policy (standard fields + module replacement)
Structure:
- `name: 'update_policy'`
- `data: object` with allowed properties (camelCase):

Supported `data` properties:
- `monthlyPremium: integer`
- `basePremium: integer`
- `billingAmount: integer`
- `billingDay: integer | null`
- `sumAssured: integer`
- `module: object` *(replaces entire policy.module)*

Example:
```javascript
{
  name: 'update_policy',
  data: { sumAssured: 5000000 }
}
```

#### Update policy module data (merge into existing module)
Structure:
- `name: 'update_policy_module_data'`
- `data: object` *(merged into existing `policy.module` by platform)*

Example:
```javascript
{
  name: 'update_policy_module_data',
  data: { extraction_benefit: false }
}
```

### 9.3 Update claim module data

Structure:
- `name: 'update_claim_module_data'`
- `data: object` *(merged into existing `claim.moduleData` by platform)*

Example:
```javascript
{
  name: 'update_claim_module_data',
  data: { assessor_notes: '...' }
}
```

### 9.4 Change policy balance (ledger)

#### Debit policy
Structure:
- `name: 'debit_policy'`
- `amount: integer` (cents)
- `description: string`
- `currency: string` (ISO 4217, must match product currency)

```javascript
{
  name: 'debit_policy',
  amount: 100000,
  description: 'Reactivation penalty',
  currency: 'USD'
}
```

#### Credit policy
Same shape as debit:
```javascript
{
  name: 'credit_policy',
  amount: 5000,
  description: 'Goodwill credit',
  currency: 'USD'
}
```

### 9.5 Trigger custom notification event
Structure:
- `name: 'trigger_custom_notification_event'`
- `custom_event_key: string`
- `custom_event_type: 'policy' | 'payment_method' | 'payment' | 'claim'`
- Identifier field depending on type:
  - `policy_id?: string` *(required if type is `policy` or `payment_method`)*
  - `payment_id?: string` *(required if type is `payment`)*
  - `claim_id?: string` *(required if type is `claim`)*

Example:
```javascript
{
  name: 'trigger_custom_notification_event',
  custom_event_key: 'policyholder_birthday',
  custom_event_type: 'policy',
  policy_id: policy.policy_id,
}
```

---

## 10. Validation with Joi (Common Patterns)

### Core pattern
Return Joi’s validation result:
```javascript
const validateX = (data) => {
  return Joi.validate(data, Joi.object().keys({ /* ... */ }).required(), { abortEarly: false });
};
```

### Throw custom errors for complex validation
```javascript
if (someCrossFieldRuleFails) {
  throw new Error('Descriptive message');
}
```

### Root date behavior
- `Joi.date()` / `Joi.string().isoDate()` default timezone is **organization timezone** if no offset provided.
- Override by:
  - including an offset in input (e.g. `2022-12-15T00:00:00+02:00`), or
  - passing tz name: `Joi.date('America/New_York')`

### Using Root extensions
```javascript
const schema = Joi.object().keys({
  id_number: Joi.string().idNumber().required(),
  cellphone: Joi.cellphone().required(),
  dob: Joi.dateOfBirth().format('YYYY-MM-DD').required(),
  imei: Joi.string().imei().optional(),
  payload: Joi.string().jsonString().required(),
});
```

---
