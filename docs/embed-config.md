# Embed Configuration Guide

How to configure embed-config.json for Embed Sales and Embed Management flows.

### 1. Overview
**Root Embed** is a white-label customer-facing frontend that can be embedded via **iframe** or used as a **standalone site**.

- **Embed | Sales**: quote → issuing flow (landing, quote, compliance, personal details, application, beneficiaries, payment, confirmation).
- **Embed | Management**: authenticated policy self-service (view policy, alterations, cancel, beneficiaries, billing day/payment method changes, claims info, personal details edits).

---

### 2. File Location
- Main config: `workflows/embed/embed-config.json`
- Input field labels + prefill behavior (often referenced as a separate file in docs; in the schema it’s **inside embed-config.json** under `inputFields`): `workflows/embed/input-fields.json` (or `embed-config.json` → `inputFields`, depending on your module setup)
- Compliance markdown bodies:
  - `documents/pre-personal-details.md` (aka `pre-personal-details-compliance.md` in examples)
  - `documents/pre-payment-details.md`

---

### 3. Configuration Sections (embed-config.json)

High-level structure (Sales + Management):
```json
{
  "styles": { },
  "settings": { },
  "header": { },
  "footer": { },

  "landing": { },
  "quote": { },
  "prePersonalDetailsCompliance": { },
  "personalDetails": { },
  "application": { },
  "beneficiaries": { },
  "prePaymentCompliance": { },
  "payment": { },
  "confirmation": { },

  "policyIssuingIFrameUrl": "",
  "inputFields": { },

  "management": { }
}
```

Common pattern per section:
- `wording`: object (copy/text)
- `images`: object (URLs)
- `links`: object (URLs/labels)
- `displayOptionalSections`: object (feature toggles)

---

## `header`
**Purpose:** top-of-flow header for Sales (title, optional logo, optional premium in progress bar)

**Properties**
- `wording?: { title?: string }`
- `images: { titleUrl?: string, titleHeight?: number }`
- `links?: {}`
- `displayOptionalSections: { titleImage?: boolean, title?: boolean, premiumInProgressBar?: boolean }`

**Example**
```json
{
  "header": {
    "wording": { "title": "Get Dinosure" },
    "images": { "titleUrl": "", "titleHeight": 40 },
    "links": {},
    "displayOptionalSections": {
      "title": true,
      "titleImage": false,
      "premiumInProgressBar": false
    }
  }
}
```

---

## `footer`
**Purpose:** footer shown across iframe (disclaimer + optional logo)

**Properties**
- `wording?: { disclaimer?: string }`
- `images?: { disclaimerUrl?: string }`
- `links?: {}`
- `displayOptionalSections?: { disclaimerImage: boolean }`

**Example**
```json
{
  "footer": {
    "wording": { "disclaimer": "Underwriter disclaimer..." },
    "images": { "disclaimerUrl": "https://.../root-logo.svg" },
    "links": {},
    "displayOptionalSections": { "disclaimerImage": true }
  }
}
```

---

## `landing` (Sales)
**Purpose:** entry page for Sales flow (marketing content)

**Properties**
- `wording?: { title?: string, subTitle?: string, description?: string[], createQuoteButton?: string, videoTitle?: string, descriptionBullets?: string[] }`
- `images?: { background?: string }`
- `links: { youTubeVideoId?: string }`
- `displayOptionalSections?: { watchVideo: boolean, descriptionBullets: boolean, displayLandingPage?: boolean, poweredBy?: boolean }`

**Example**
```json
{
  "landing": {
    "wording": {
      "title": "Get Dinosure",
      "subTitle": "From R149 p/m",
      "description": ["..."],
      "descriptionBullets": ["Early warning network", "Extraction team"],
      "createQuoteButton": "Let's get started!",
      "videoTitle": "Dinosure Emergency Insurance"
    },
    "images": { "background": "https://.../bg.svg" },
    "links": { "youTubeVideoId": "PJlmYh27MHg" },
    "displayOptionalSections": {
      "watchVideo": true,
      "descriptionBullets": true,
      "displayLandingPage": true,
      "poweredBy": false
    }
  }
}
```

---

## `quote` (Sales)
**Purpose:** quote UX copy + optional consent modal + optional screening questions + support config

**Properties**
- `wording?: {`
  - `title?: string`
  - `description?: string`
  - `coverRejected?: string`
  - `screeningQuestionsDescription?: string`
  - `screeningQuestionsRejected?: string`
  - `summary?: string[]`
  - `callToAction?: string`
  - `premiumTitle?: string`
  - `quotePackagesTitle?: string`
  - `consentDisclaimer?: { title: string, consentItems: string[] }`
  - `screeningQuestions?: { key: string, header: string, question: string }[]`
  - `}`
- `images?: {}`
- `links?: {`
  - `supportEmail?: string`
  - `supportUrl?: { label: string, url: string }`
  - `supportType?: "email" | "url" | "phone" | "overrideMessage"`
  - `exitRedirect?: string`
  - `}`
- `displayOptionalSections?: { screeningQuestions?: boolean, screeningQuestionsRetry?: boolean, consentDisclaimer?: boolean }`

**Example**
```json
{
  "quote": {
    "wording": {
      "description": "Please complete the steps below...",
      "coverRejected": "life cover",
      "consentDisclaimer": {
        "title": "Consent",
        "consentItems": ["Consent to collecting and processing info."]
      },
      "screeningQuestionsDescription": "Before we begin...",
      "screeningQuestionsRejected": "Not the best solution for you.",
      "callToAction": "Sign me up!",
      "premiumTitle": "You pay",
      "screeningQuestions": [
        { "key": "declined_cover", "header": "In the last 5 years...", "question": "Have you been declined cover?" }
      ]
    },
    "images": {},
    "links": {
      "supportUrl": { "label": "support", "url": "https://support..." },
      "supportType": "url"
    },
    "displayOptionalSections": {
      "consentDisclaimer": true,
      "screeningQuestions": true,
      "screeningQuestionsRetry": true
    }
  }
}
```

**Screening questions behavior**
- Enabled by `displayOptionalSections.screeningQuestions: true`
- Retry option by `displayOptionalSections.screeningQuestionsRetry: true`
- Each question needs a unique `key` (snake_case recommended)

---

## `prePersonalDetailsCompliance` (Sales)
**Purpose:** optional compliance step shown before personal details; body stored in markdown file

**Properties**
- `wording?: { title?: string, description?: string, content?: string }`
- `images?: {}`
- `links?: { exitRedirect?: string }`
- `displayOptionalSections?: { displayPrePersonalDetailsCompliance?: boolean }`

**Example**
```json
{
  "prePersonalDetailsCompliance": {
    "wording": {
      "title": "Pre personal details compliance",
      "description": "Read the following terms..."
    },
    "images": {},
    "links": { "exitRedirect": "https://dinoparks.net/" },
    "displayOptionalSections": { "displayPrePersonalDetailsCompliance": true }
  }
}
```

---

## `personalDetails` (Sales)
**Purpose:** configure personal details step behavior (skip on prefill, contact fields, autocomplete)

**Properties**
- `wording?: { title?: string, description?: string }`
- `images?: {}`
- `links?: {}`
- `displayOptionalSections?: {`
  - `skipOnPrefill?: boolean`
  - `contactDetailTypes?: ("email" | "cellphone")[]` (min 1)
  - `fetchifyAutoComplete?: boolean`
  - `}`

**Example**
```json
{
  "personalDetails": {
    "wording": { "title": "Personal details", "description": "Let's get to know you..." },
    "images": {},
    "links": {},
    "displayOptionalSections": {
      "skipOnPrefill": true,
      "contactDetailTypes": ["email", "cellphone"],
      "fetchifyAutoComplete": true
    }
  }
}
```

---

## `application` (Sales)
**Purpose:** extra underwriting/application questions (driven by application schema); config mainly copy

**Properties**
- `wording?: { title?: string, description: string }`
- `images?: {}`
- `links?: {}`
- `displayOptionalSections?: {}`

**Example**
```json
{
  "application": {
    "wording": { "title": "Additional details", "description": "Please complete the additional details..." },
    "images": {},
    "links": {},
    "displayOptionalSections": {}
  }
}
```

---

## `beneficiaries` (Sales)
**Purpose:** optional beneficiary capture step during issuing

**Properties**
- `wording?: { title?: string, description?: string }`
- `images?: {}`
- `links?: {}`
- `displayOptionalSections?: { displayManageBeneficiaries?: boolean }`

**Example**
```json
{
  "beneficiaries": {
    "wording": {
      "title": "Protect your loved ones",
      "description": "Add up to 10 beneficiaries..."
    },
    "images": {},
    "links": {},
    "displayOptionalSections": { "displayManageBeneficiaries": true }
  }
}
```

---

## `prePaymentCompliance` (Sales)
**Purpose:** optional compliance step before payment; body stored in markdown file

**Properties**
- `wording?: { title?: string, description?: string, content?: string }`
- `images?: {}`
- `links?: { exitRedirect?: string }`
- `displayOptionalSections?: { displayPrePaymentCompliance: boolean }`

**Example**
```json
{
  "prePaymentCompliance": {
    "wording": { "title": "Pre payment details compliance", "description": "Read the following terms..." },
    "images": {},
    "links": { "exitRedirect": "https://dinoparks.net/" },
    "displayOptionalSections": { "displayPrePaymentCompliance": true }
  }
}
```

---

## `payment` (Sales)
**Purpose:** policy summary + payment method capture + declarations/consents

**Properties**
- `wording?: {`
  - `title?: string`
  - `description?: string`
  - `declaration?: string`
  - `summary?: ({ label: string, content: string }[] | string[])`
  - `callToAction?: string`
  - `consentItems?: string[]`
  - `consentIdentifierOverride?: string`
  - `}`
- `images?: {}`
- `links?: {}`
- `displayOptionalSections?: {`
  - `billingDay?: boolean`
  - `editBillingDay?: boolean`
  - `displayPaymentMethod?: boolean`  *(required in validation schema)*
  - `displayPaymentDeclaration?: boolean`
  - `}`

**Example (handlebars summary)**
```json
{
  "payment": {
    "wording": {
      "title": "Payment",
      "description": "Almost done!",
      "consentItems": ["The information provided is true and correct."],
      "consentIdentifierOverride": "I, the policyholder confirm that:",
      "summary": [
        { "label": "Cover amount", "content": "{{formatCurrency application.sum_assured application.currency}}" },
        { "label": "Policyholder", "content": "{{application.policyholder.first_name}} {{application.policyholder.last_name}}" }
      ],
      "declaration": "Disclaimer text..."
    },
    "images": {},
    "links": {},
    "displayOptionalSections": {
      "displayPaymentMethod": true,
      "billingDay": true
    }
  }
}
```

---

## `confirmation` (Sales)
**Purpose:** post-issue success page + redirect + claim link + contact info

**Properties**
- `wording?: { title?: string, subTitle?: string, description?: string, contactNumber?: string, contactNumberDescription?: string, secondarySubTitle?: string, secondaryButton?: string, primaryButton?: string }`
- `images?: {}`
- `links?: { redirectOnCompletedUrl?: string, openClaim?: string }`
- `displayOptionalSections?: { displayConfirmation?: boolean, contactNumber?: boolean, secondarySubTitle?: boolean, contactNumberDescription?: boolean, secondaryButton?: boolean, primaryButton?: boolean }`

**Example**
```json
{
  "confirmation": {
    "wording": {
      "title": "Confirmation",
      "subTitle": "Thank you...",
      "description": "You are now covered...",
      "contactNumberDescription": "or call us on",
      "contactNumber": "013 456 7890",
      "secondarySubTitle": "Want to make a claim?",
      "secondaryButton": "Fill out our online form",
      "primaryButton": "Back to home"
    },
    "images": {},
    "links": {
      "openClaim": "https://dinoparks.net/claims",
      "redirectOnCompletedUrl": "https://dinoparks.net/"
    },
    "displayOptionalSections": {
      "displayConfirmation": true,
      "contactNumber": true,
      "contactNumberDescription": true,
      "secondarySubTitle": true,
      "secondaryButton": true,
      "primaryButton": true
    }
  }
}
```

---

## `policyIssuingIFrameUrl`
**Purpose:** optional string URL override/reference for issuing iframe entry.
- Type: `string` (optional)

---

## `inputFields`
**Purpose:** configure field labels and **prefillAction** behavior for Personal Details / Beneficiaries (Sales + Management).

**Properties**
- `personalDetails: PersonalDetailsInputFields`
- `beneficiaries?: BeneficiaryInputFields`
- `management?: { personalDetails: PersonalDetailsInputFields, beneficiaries: ManagementBeneficiaryInputFields }`

See Section **6. Input Fields Configuration** for full field lists and types.

---

## `management` (Management add-on wrapper)
**Purpose:** config for management pages. Nested sections:
- `policyDetails`
- `beneficiaries`
- `claim`
- `payment`
- `policyView` *(optional)*
- `personalDetails` *(optional)*

See Section **7. Management Section**.

---

## `settings`
**Purpose:** global Embed configuration (support, persistence, analytics, starting step)

**Properties**
- `issuingFlowStartingStep?: "default" | "personalDetails"`
- `defaultCountryCodeFromBrowser: boolean`
- `supportEmail?: string`
- `supportContactNumber?: { label: string, number: string }`
- `overrideSupportMessage?: string`
- `supportUrl?: { label: string, url: string }`
- `supportType?: "email" | "url" | "phone" | "overrideMessage"`
- `enableSessionPersistence?: boolean`
- `mixpanelProjectToken: string | undefined`
- Also validated in schema (if present in your module):  
  - `stripePublishableKey?: string`
  - `googlePlacesApiKey?: string`

**Example**
```json
{
  "settings": {
    "issuingFlowStartingStep": "default",
    "defaultCountryCodeFromBrowser": true,
    "supportType": "email",
    "supportEmail": "your-company@support.com",
    "overrideSupportMessage": "Something went wrong...",
    "enableSessionPersistence": true,
    "mixpanelProjectToken": "<mixpanel_project_token>"
  }
}
```

---

### 4. Styles Configuration

## `styles`
**Purpose:** global theme + UI behavior

**Properties**
- `colors: {`
  - `primary: string`
  - `highlight: string`
  - `dark: string`
  - `light: string`
  - `success: string`
  - `warning: string`
  - `error: string`
  - `disabled: string`
  - `backgroundHighlight: string`
  - `border: string`
  - `policyStatusActive?: string`
  - `policyStatusCancelled?: string`
  - `policyStatusPending?: string`
  - `policyStatusExpired?: string`
  - `policyStatusNotTakenUp?: string`
  - `policyStatusLapsed?: string`
  - `}`
- `fontFamily: { title: string, body: string }`
- `fontSize: { title: string, subTitle: string, body: string, subscript: string, button: string, footer?: string }`
- `borderRadius: { button: string }` (e.g. `"8px"`)
- `disableSteppedComponents?: boolean` (turn off stepped/section-by-section UI)

**Example**
```json
{
  "styles": {
    "borderRadius": { "button": "8px" },
    "colors": {
      "dark": "#000000",
      "error": "#ff2b38",
      "light": "#FFFFFF",
      "border": "rgba(0, 0, 0, 0.125)",
      "primary": "#240E8B",
      "success": "#1fc881",
      "warning": "#FC64B1",
      "disabled": "#CDD4DE",
      "highlight": "#FC64B1",
      "backgroundHighlight": "rgba(245, 247, 252, 1)",
      "policyStatusActive": "#1fc881",
      "policyStatusPending": "#ffab00",
      "policyStatusCancelled": "#d50001",
      "policyStatusExpired": "#ffab00",
      "policyStatusNotTakenUp": "#d50001",
      "policyStatusLapsed": "#d50001"
    },
    "fontFamily": { "title": "Lato", "body": "Lato" },
    "fontSize": {
      "body": "16px",
      "title": "40px",
      "button": "14px",
      "subTitle": "22px",
      "subscript": "8px",
      "footer": "8px"
    },
    "disableSteppedComponents": false
  }
}
```

---

### 5. Embed Color System (Applied Styles)

#### How colors are applied
- Components resolve colors via a helper like:
  - `getColor({ siteConfig, color: "primary" })`
- That helper reads from `styles.colors` in `embed-config.json`.

#### Component color mappings (key usage)
| Component | Color keys used | Usage |
|---|---|---|
| PrimaryButton | `primary` + white | background/border primary; text white |
| SecondaryButton | `light` + `primary` | background/border light; text primary |
| DangerButton | `warning` + white | background/border warning; text white |
| TextButton | white / `primary` | text primary |
| DisabledButton | `disabled` (and/or #DADADA) | disabled background/border/text |
| Form Input | `border` / `primary` / `error` / `disabled` | default/focus/error/disabled states |
| Card | `border` / `light` | border + background |
| Alerts | `highlight` (with opacity) | alert background/border/text |
| Progress Bar | `primary`, `disabled` | progress, back arrows, spinner |
| Header/Nav | `primary` + `light` | bar background + text |
| Description containers | `light` | background |
| Stepper | `highlight` + `border` | step circles |
| Dividers | `disabled` | 1px line |

**To change a color:** edit the corresponding `styles.colors.<key>` value and redeploy.

---

### 6. Input Fields Configuration

#### Prefill values (Sales, via query params)
Inject JSON strings via URL query parameters:

| Query parameter | Type | Purpose |
|---|---|---|
| `quote_values` | `string` | JSON string of quote schema fields |
| `personal_details_values` | `string` | JSON string of policyholder/personal details |
| `application_values` | `string` | JSON string of application schema fields |
| `payment_values` | `string` | JSON string of payment fields (debit order/external) |

**Example (quote)**
```
quote_values={"type":"dinosure","age":32,"smoker":false}
```

**Example (personal details)**
```
&personal_details_values={"first_name":"Erlich","last_name":"Bachman","identification_type":"passport", ...}
```

**Skipping personal details on prefill**
- `personalDetails.displayOptionalSections.skipOnPrefill: boolean`
- If `true` and *all required personal details are successfully prefilled*, the step can be skipped/auto-submitted.

#### Prefill actions (field behavior when prefilled)
Controls what happens **if a valid prefill value exists**.

Valid values (as implemented for input fields):
- `"none"`: show and allow editing (default behavior)
- `"hidden"`: hide the field
- `"disabled"`: show but read-only

> Note: Some older text describes `show/hide/disable`. In current config schemas the values are `none/hidden/disabled`.

---

## `inputFields.personalDetails` (Sales + Management label overrides)
**Type:** `PersonalDetailsInputFields`  
Each entry is either:
- `EmbedInputField`: `{ label: string, prefillAction: "none"|"hidden"|"disabled" }`
- `EmbedLabelOnlyInputField`: `{ label: string }` (label only)

**PersonalDetailsInputFields keys**
- `firstName: EmbedInputField`
- `lastName: EmbedInputField`
- `idType: EmbedInputField`
- `identificationNumber: EmbedInputField` *(supports `{{selected_identification_type}}` token in label)*
- `identificationCountry: EmbedInputField`
- `identificationExpirationDate: EmbedInputField`
- `gender: EmbedInputField`
- `dateOfBirth: EmbedInputField`
- `email: EmbedInputField`
- `cellphone: EmbedInputField`
- `addressOptIn: EmbedInputField`
- `addressLine1: EmbedInputField`
- `addressLine2: EmbedInputField`
- `areaCode: EmbedInputField`
- `suburb: EmbedInputField`
- `city: EmbedInputField`
- `country: EmbedInputField`
- `registrationNumber: EmbedInputField`
- `companyName: EmbedInputField`
- `subsidiaryCompanies: EmbedInputField`
- `dateOfEstablishment: EmbedInputField`
- `companyWebsiteUrl: EmbedInputField`
- `policyholderType: EmbedInputField`
- `contactPosition: EmbedInputField`
- `fetchifyAutocomplete: EmbedInputField`
- `googlePlacesAutocomplete: EmbedLabelOnlyInputField`

**Example**
```json
{
  "inputFields": {
    "personalDetails": {
      "email": { "label": "What is your email address?", "prefillAction": "hidden" },
      "gender": { "label": "What is your gender?", "prefillAction": "disabled" },
      "identificationNumber": {
        "label": "What is your {{selected_identification_type}} number?",
        "prefillAction": "none"
      }
    }
  }
}
```

---

## `inputFields.beneficiaries` (Sales beneficiaries step)
**Type:** `BeneficiaryInputFields` (label-only fields)

**Keys**
- Required label-only fields:
  - `title`, `firstName`, `lastName`, `relationship`, `idType`, `identificationNumber`, `identificationCountry`, `gender`, `email`, `cellphone`
- Optional label-only fields:
  - `dateOfBirth?`, `addressLine1?`, `addressLine2?`, `areaCode?`, `suburb?`, `city?`, `country?`

**Example**
```json
{
  "inputFields": {
    "beneficiaries": {
      "firstName": { "label": "Name" },
      "lastName": { "label": "Surname" },
      "identificationNumber": { "label": "{{selected_identification_type}} number" }
    }
  }
}
```

---

## `inputFields.management.beneficiaries` (Management beneficiaries screen)
**Type:** `ManagementBeneficiaryInputFields` (label + prefill action)

Same keys as Sales beneficiaries, but each is:
`{ label: string, prefillAction: "none"|"hidden"|"disabled" }`, with the same optional address/date fields.

---

### 7. Management Section

All nested under `management`.

## `management.policyDetails`
**Purpose:** policy summary + alteration hooks + cancellation entry; supports status badge colors via `styles.colors.policyStatus...`

**Properties**
- `wording: { title?: string, description?: string, summary?: { label: string, content: string }[] }`
- `images: {}`
- `links: { exitRedirect: string }`
- `displayOptionalSections: { alterationHooks?: { key: string, enabled?: boolean }[] }`

**Example**
```json
{
  "management": {
    "policyDetails": {
      "wording": {
        "title": "Policy details",
        "description": "These are your policy details",
        "summary": [
          { "label": "Cover amount", "content": "{{formatCurrency policy.sum_assured policy.currency}}" }
        ]
      },
      "images": {},
      "links": { "exitRedirect": "https://dinoparks.net/" },
      "displayOptionalSections": {
        "alterationHooks": [{ "key": "my_alteration_hook", "enabled": true }]
      }
    }
  }
}
```

## `management.beneficiaries`
**Purpose:** manage beneficiaries post-issue

**Properties**
- `wording: { title?: string }`
- `images: {}`
- `links: { exitRedirect: string }`
- `displayOptionalSections: { readonlyView?: boolean }`

## `management.claim`
**Purpose:** claim instructions + optional CTA button + optional contact number

**Properties**
- `wording: { title?: string, description: string, contactNumber: string, callToAction?: string }`
- `images: {}`
- `links: { exitRedirect: string, openClaim: string }`
- `displayOptionalSections: { contactNumber?: boolean, callToAction?: boolean, displayClaimSection?: boolean }`

## `management.payment`
**Purpose:** update payment method and/or billing day (optional by hiding all toggles)

**Properties**
- `wording: { title?: string, description?: string }`
- `images: {}`
- `links: { exitRedirect: string }`
- `displayOptionalSections: { editPaymentMethod?: boolean, viewPaymentMethod?: boolean, editBillingDay?: boolean }`

## `management.policyView` *(optional)*
**Purpose:** overview/landing within management

**Properties**
- `wording?: { title?: string, description?: string, contactDescription?: string, contactNumber?: string }`
- `images?: {}`
- `links?: { exitRedirect?: string }`
- `displayOptionalSections?: { contactNumber?: boolean }`

## `management.personalDetails` *(optional)*
**Purpose:** edit policyholder personal details

**Properties**
- `wording?: { title?: string, description?: string }`
- `images?: {}`
- `links?: { exitRedirect?: string }`
- `displayOptionalSections?: { readonlyView?: boolean }`

---

### 8. Settings (Global)

Covered in Section 3 (`settings`). Key behaviors:
- `issuingFlowStartingStep`: `"default"` or `"personalDetails"` (moves personal details before quote).
- `defaultCountryCodeFromBrowser`: infer country from browser.
- Support routing:
  - `supportType`: `"email" | "url" | "phone" | "overrideMessage"`
  - plus matching fields:
    - `"email"` → `supportEmail`
    - `"url"` → `supportUrl`
    - `"phone"` → `supportContactNumber`
    - `"overrideMessage"` → `overrideSupportMessage`
- `enableSessionPersistence`: keep session across reloads.
- `mixpanelProjectToken`: enable Mixpanel tracking.
- If enabled in your build: `stripePublishableKey`, `googlePlacesApiKey`.

---

---

## Embed Testing

**IMPORTANT**: To test your embed changes:

1. Click **Run** or run `node preview/server.js`
2. Edit `workflows/embed/embed-config.json`
3. Run `npx @rootplatform/cli push -f` (ALWAYS use -f flag)
4. Click "Refresh Embed" in the preview window

### Direct Embed URL (Draft Mode):
```
http://localhost:4201/root_funeral?api_key=sandbox_NjA5YjUwYjEtYzlmNi00OGI5LWI1ZTQtZDVlYTU1NjZjM2MzLnRGNDJ0dVhYLW5TaGF3dmdFOXRTc0h3Y1NrZWZibFp5&draft_definition=true
```
