# Appwrite Login + Sign Up Page

A responsive, production-ready starting point for Appwrite email/password authentication.

## Features
- Email/password sign up
- Automatic login after successful registration
- Email/password login
- Existing-session detection with `account.get()`
- Logout
- Password visibility toggle
- Client-side validation
- Friendly Appwrite error messages
- Responsive design

## Appwrite setup
1. Create an Appwrite project in the Appwrite Console.
2. Enable Email/Password authentication for the project.
3. Add a **Web** platform and enter the hostname where this page will run. Appwrite requires a Web platform so the browser app is allowed to communicate with the project.
4. Open `app.js` and replace:

```js
const APPWRITE_PROJECT_ID = 'YOUR_PROJECT_ID';
```

with your actual Appwrite Project ID.

The default endpoint is:

```text
https://cloud.appwrite.io/v1
```

If you use a different Appwrite region or a self-hosted Appwrite installation, change `APPWRITE_ENDPOINT` accordingly.

## Run locally
Use any static web server rather than opening the file directly. For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` and add `localhost` (or `localhost:8080`, depending on Appwrite's platform configuration) as a Web platform in Appwrite.

## Important security note
This browser implementation uses the Appwrite **Client/Account API**, so you should never put an Appwrite server API key in `app.js`. Server API keys belong on a trusted backend. Appwrite handles password hashing and session management.
