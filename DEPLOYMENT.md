# Interview Prep Assistant — Setup & Deployment Guide

This guide explains how to build, install, and use the **Interview Prep Assistant** Chrome extension. It also covers how AI providers are connected — the extension uses **your own API key** from the AI service you already use (OpenAI, Anthropic, or Google AI).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Build the Extension](#build-the-extension)
3. [Install in Chrome (Load Unpacked)](#install-in-chrome-load-unpacked)
4. [Development Mode (Optional)](#development-mode-optional)
5. [Connect Your AI Provider](#connect-your-ai-provider)
6. [How to Use the Extension](#how-to-use-the-extension)
7. [Updating After Code Changes](#updating-after-code-changes)
8. [Publishing to Chrome Web Store (Optional)](#publishing-to-chrome-web-store-optional)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, make sure you have:

| Requirement | Details |
|-------------|---------|
| **Google Chrome** | Version 114 or newer (Manifest V3 support) |
| **Node.js** | Version 18 or newer |
| **npm** | Comes with Node.js |
| **AI provider account** | OpenAI, Anthropic, or Google AI (see below) |

> **Important:** This extension does **not** use a separate login screen inside the extension. You connect AI by pasting an **API key** from the provider where you already have an account. Usage is billed to **your** AI account, not to the extension.

---

## Build the Extension

Open a terminal in the project folder and run:

```bash
cd d:\extension\interview-prep-extension
npm install
npm run build
```

When the build succeeds, a `dist/` folder is created. **This is the folder you load into Chrome.**

Verify the build:

```bash
npm run test
npm run typecheck
```

---

## Install in Chrome (Load Unpacked)

This is the standard way to run the extension locally or share it with a team without publishing to the Chrome Web Store.

### Step 1 — Open Extensions page

1. Open Chrome.
2. Go to `chrome://extensions`
3. Turn on **Developer mode** (toggle in the top-right corner).

### Step 2 — Load the extension

1. Click **Load unpacked**.
2. Select the **`dist`** folder inside this project:
   ```
   d:\extension\interview-prep-extension\dist
   ```
3. The **Interview Prep Assistant** icon should appear in your Chrome toolbar.

### Step 3 — Pin the extension (recommended)

1. Click the **puzzle piece** icon in the Chrome toolbar.
2. Find **Interview Prep Assistant**.
3. Click the **pin** icon so it stays visible.

### Step 4 — First-time setup

On first install, Chrome opens the **Settings / Options** page automatically. If it does not:

1. Go to `chrome://extensions`
2. Find **Interview Prep Assistant**
3. Click **Details** → **Extension options**

Or open the extension popup and go to the **Settings** tab.

---

## Development Mode (Optional)

Use this when you are actively changing code and want live reload:

```bash
npm run dev
```

Then in `chrome://extensions`:

1. Click **Load unpacked** and select the `dist` folder (created/updated by Vite).
2. After code changes, click the **reload** icon on the extension card in `chrome://extensions`.

> For day-to-day use (not development), prefer `npm run build` and reload the extension once.

---

## Connect Your AI Provider

The extension supports three AI providers. You choose **one** in Settings and provide an API key from that provider.

### How authentication works

```
Your AI account (OpenAI / Anthropic / Google)
        ↓
You create an API key on their website
        ↓
You paste the key in extension Settings
        ↓
Extension encrypts and stores the key locally
        ↓
When you analyze a job, the extension calls that provider's API using your key
```

- **No extension login** — you use your existing AI provider account.
- **Your key, your usage** — API calls are charged to your provider account.
- **Stored securely** — keys are encrypted on your device (AES-GCM via Web Crypto) before being saved in Chrome storage.
- **Never shared** — the key is only sent to the AI provider you selected (over HTTPS).

---

### Option A — OpenAI (ChatGPT API)

**Best if you already use OpenAI / ChatGPT.**

1. Sign in at [https://platform.openai.com](https://platform.openai.com)
2. Go to **API keys**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. Click **Create new secret key**
4. Copy the key (starts with `sk-`)
5. In the extension **Settings**:
   - **AI Provider:** OpenAI
   - **API Key:** paste your `sk-...` key
   - Click **Save Settings**

**Billing:** Ensure your OpenAI account has credits or a payment method. See [OpenAI pricing](https://openai.com/api/pricing/).

---

### Option B — Anthropic (Claude API)

**Best if you already use Claude / Anthropic.**

1. Sign in at [https://console.anthropic.com](https://console.anthropic.com)
2. Go to **API Keys**
3. Create a new key (starts with `sk-ant-`)
4. In the extension **Settings**:
   - **AI Provider:** Anthropic
   - **API Key:** paste your `sk-ant-...` key
   - Click **Save Settings**

**Billing:** See [Anthropic pricing](https://www.anthropic.com/pricing).

---

### Option C — Google AI (Gemini API)

**Best if you already use Google AI Studio / Gemini.**

1. Sign in at [https://aistudio.google.com](https://aistudio.google.com)
2. Go to **Get API key** / [Google AI Studio API keys](https://aistudio.google.com/apikey)
3. Create an API key for your Google account
4. In the extension **Settings**:
   - **AI Provider:** Google AI
   - **API Key:** paste your Google AI key
   - Click **Save Settings**

**Billing:** See [Google AI pricing](https://ai.google.dev/pricing).

---

### Optional — Encryption passphrase

In Settings you can set an **Encryption Passphrase** for extra protection of your stored API key.

- If you set one, you must use the **same passphrase** whenever the extension decrypts the key.
- If you forget it, delete the stored key and enter a new API key.

---

### Settings reference

| Setting | Description |
|---------|-------------|
| **AI Provider** | OpenAI, Anthropic, or Google AI |
| **API Key** | Secret key from your provider's dashboard |
| **Encryption Passphrase** | Optional extra layer for local encryption |
| **Use consolidated prompt** | Single API call (faster, lower cost) vs. multiple parallel calls (more detailed) |

---

## How to Use the Extension

### Supported job sites

- LinkedIn (`linkedin.com`)
- Indeed (`indeed.com`)
- Glassdoor (`glassdoor.com`)
- Google Careers (`careers.google.com`)
- Apple Careers (`careers.apple.com`)

### Analyze a job posting

1. **Open a job posting** on one of the supported sites (full job detail page, not search results).
2. Click the **Interview Prep** extension icon in the toolbar.
3. Confirm **Settings** shows your API key as configured (green “configured” label).
4. Click **Analyze This Job**.
5. Wait ~30–45 seconds while AI generates prep materials.
6. Review sections: Technical Topics, Behavioral Questions, Company Research, Interview Process, Salary Insights.
7. Click **Save Analysis** to store it in history.

### View saved analyses

1. Open the extension popup.
2. Go to the **History** tab.
3. Click an entry to reload that analysis.
4. Use **Export MD** to download a Markdown file.
5. Use **Delete** to remove a saved analysis.

### Export to Markdown

From the **History** tab, click **Export MD** on any saved analysis. Chrome downloads a `.md` file you can open in any text editor or notes app.

---

## Updating After Code Changes

If you pull new code or make changes:

```bash
npm run build
```

Then in `chrome://extensions`:

1. Find **Interview Prep Assistant**
2. Click the **reload** (circular arrow) button

Your saved analyses and API key settings are kept unless you clear extension data.

---

## Publishing to Chrome Web Store (Optional)

To distribute the extension publicly (not required for personal or team use):

1. **Build for production**
   ```bash
   npm run build
   ```
2. **Zip the `dist` folder** (zip the contents of `dist`, not the parent folder name).
3. **Register** as a Chrome Web Store developer: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. **Pay** the one-time developer registration fee (if applicable).
5. **Upload** the zip, add description, screenshots, and privacy policy.
6. **Note for reviewers:** The extension requires users to supply their own third-party AI API keys; document this clearly in your store listing.

For internal/team use, **Load unpacked** is usually enough and does not require store publishing.

---

## Troubleshooting

### “Configure your API key in Settings”

- Open **Settings** (popup or extension options).
- Select your provider and paste a valid API key.
- Click **Save Settings**.

### “Navigate to a job posting…”

- You must be on a **job detail page**, not a search or list page.
- URL should be on LinkedIn, Indeed, Glassdoor, or a supported careers site.

### “Failed to extract job description”

- Refresh the job page and try again.
- Some sites change their HTML; ensure the full description is visible on the page.

### “API credentials not configured”

- API key was not saved. Re-enter it in Settings and save again.

### “Invalid API key format”

| Provider | Key format |
|----------|------------|
| OpenAI | Starts with `sk-` |
| Anthropic | Starts with `sk-ant-` |
| Google AI | Long alphanumeric string from Google AI Studio |

### API errors (401, 403, 429)

- **401/403:** Key is wrong or expired — create a new key on the provider site.
- **429:** Rate limit — wait a few minutes or check your provider quota/billing.
- **Insufficient credits:** Add billing or credits on your OpenAI / Anthropic / Google account.

### Extension not updating after build

- Click **reload** on `chrome://extensions` for this extension.
- Confirm you loaded the **`dist`** folder, not the project root.

### Analyze button stays disabled

- API key must be configured.
- You must be on a supported job site tab.
- Wait if a previous analysis is still running.

---

## Quick Start Checklist

- [ ] `npm install` and `npm run build`
- [ ] Load `dist/` folder in `chrome://extensions` (Developer mode on)
- [ ] Pin extension to toolbar
- [ ] Sign in to OpenAI, Anthropic, or Google AI and create an API key
- [ ] Paste API key in extension Settings and save
- [ ] Open a job posting on LinkedIn / Indeed / Glassdoor
- [ ] Click **Analyze This Job**
- [ ] Save and export analysis from History

---

## Security Reminders

- Do not share your API key or commit it to git.
- The `.env` file is for optional local development only; the extension stores keys in Chrome storage at runtime.
- Revoke keys you no longer use from your provider's dashboard.
- All AI requests go directly from your browser to the provider over HTTPS.

---

## Need Help?

- **Build issues:** Run `npm run test` and `npm run typecheck` and fix any reported errors.
- **Usage questions:** See [README.md](./README.md) for project overview and architecture.
- **Provider billing/limits:** Check your AI provider's documentation and account dashboard.
