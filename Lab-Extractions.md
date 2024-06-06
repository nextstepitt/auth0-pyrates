![Banner Light](./.assets/nsbanner-light.png#gh-light-mode-only)
![banner Dark](./.assets/nsbanner-dark.png#gh-dark-mode-only)

# Customer Identity with OAuth2 and OIDC<br>Lab Extractions

## Overview

This file documents the steps required to move from the solution to the starter for each lab.

## Lab 01

1. Clear the values (and leave the attributes) from the .env file: ISSUER_BASE_URL, CLIENT_ID, CLIENT_SECRET.
1. Use npm to uninstall express-openid-connect from package.json.
1. ./src/pyrates/homeController.js:
    1. Remove the import of express-openid-connect.
    1. The configuration of the auth middleware (leave the comment lines).
    1. The setting of the auth middleware.
    1. Remove requiresAuth() from all middleware declarations.
