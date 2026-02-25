# Data Safety Declaration - NIABrowser

> For Google Play Console > Data Safety section
> And App Store Connect > App Privacy section

## Overview

NIABrowser does NOT collect, share, or transmit any user data to our servers.
All data stays on the user's device.

---

## Google Play - Data Safety Answers

### Does your app collect or share any of the required user data types?
**No**

### Is all of the user data collected by your app encrypted in transit?
**Yes** — All network requests use HTTPS

### Do you provide a way for users to request that their data is deleted?
**Yes** — Users can clear all data from Settings > Data > Clear All Data

---

### Data Types Breakdown

| Data Type | Collected? | Shared? | Notes |
|-----------|-----------|---------|-------|
| Personal info (name, email) | No | No | No accounts or registration |
| Financial info | No | No | No payments in-app |
| Location | No | No | No location access |
| Web browsing history | Collected | Not shared | Stored locally only, user can clear |
| App activity | No | No | — |
| Device or other IDs | No | No | No analytics or tracking |
| Files and docs | No | No | — |
| Photos and videos | No | No | Screenshot saves to user's gallery only |
| Contacts | No | No | — |
| Messages | No | No | — |

### Additional Notes for Reviewer

1. **API Keys**: Users enter their own AI provider API keys. These are stored locally on the device using AsyncStorage. Keys are sent ONLY to the user's chosen AI provider (Google, OpenRouter, OpenAI, or custom) — never to our servers.

2. **AI Conversations**: Chat messages are sent to the user's chosen AI provider for processing. We have no access to these conversations.

3. **Browsing Data**: History, favorites, cookies, and localStorage data are stored locally and never transmitted.

4. **Scripts**: User-created scripts are stored locally only.

5. **No Analytics**: The app contains no analytics SDKs, no crash reporting, no telemetry.

6. **No Ads**: The app contains no advertising.

---

## App Store - App Privacy Answers

### Data Linked to You
**None** — No data is linked to user identity

### Data Used to Track You
**None** — No tracking

### Data Not Linked to You
- **Usage Data**: Browsing history stored locally (not collected by developer)

### Data Not Collected
All other categories — we collect nothing.

---

## Privacy Policy URL
```
https://niabrowser.vibzcode.com/privacy.html
```
