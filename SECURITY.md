# Security policy

## Supported versions

Security fixes are made on the `main` branch, which is what the live site deploys.

## Reporting a vulnerability

Please report vulnerabilities privately, not in a public issue. Use GitHub's private reporting: open the repository's **Security** tab and choose **Report a vulnerability**.

Include what you found, how to reproduce it, and the impact you expect. You'll get a reply once the report has been reviewed.

## Scope notes

- Sigcraft has no accounts, database or stored user data. Signature details are kept only in the visitor's own browser (`localStorage`).
- The icon endpoint (`/api/icon/...`) only accepts a fixed set of styles, icon names and hex colours, and returns 404 for anything else.
- Third-party code loaded in the browser: Google Fonts and the SupportKori widget (`https://www.supportkori.com/widget.js`).
