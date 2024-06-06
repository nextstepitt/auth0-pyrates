![Banner Light](./.assets/nsbanner-light.png#gh-light-mode-only)
![banner Dark](./.assets/nsbanner-dark.png#gh-dark-mode-only)

# Customer Identity with OAuth2 and OIDC

## Overview

Customer and workforce identity are identical from a technical standpoint, and
everything in this course and these labs addresses writing applications for both environments.
To be fair when building customer facing applications using OAuth2 and OIDC is the popular choice while
workforce applications are often built with the Security Assertion Markup Language (SAML) which is a whole other topic.
The ONLY technical difference between customer and workforce is how logouts are handled:
in customer identity the user is logged off of both the application and the identity provider (IdP), because they
expect to see an authentication screen if they come back.
In workforce identity the applications are typically third-party and only concerned with themselves.
Leaving an application means the user remains logged into the IdP so if they visit another application for thier job
re-authentication is not required (single sign-on, SSO).

Pyrates is the lab project that supports the Customer Identity with OAuth2 and OIDC course.
This is a Visual Studio Code multi-workspace project, each lab is contained in its own workspace.

The Identity as a Service (IDaaS) provider for these labs is Auth0, and uses the Auth0 SDKs.
This is simply because Auth0 provides a free tier of service for customer identity, while many other providers do not.
OAuth2 and OIDC providers all follow similar patterns, so the labs are adaptable to the SDKs
of whatever provider is deemed necessary.

The labs are accomplished using a Node.js environment; both server-side Express applications and
client-side single-page applications written in JavaScript are explored.
The Express framework uses a middleware architecture, which is also used by Spring Boot, .NET Framework, and
other environments.
The exploration of identity using OAuth2 and OIDC in these labs is meant to be agnostic and translate
comfortably across many environments.

While not the focus of the class, the labs include complete suites of unit, integration, and acceptance tests.
These should run correcly when the application and services in the labs are configured properly.
The tests are built using [*Vitest*](https://vitest.dev/) and [*Puppeteer*](https://pptr.dev/),
and are designed to be a starting point for good testing in an application using federated identity.

## Lab Overview

These hands-on lab depends on:
* Auth0 administrative account and a development tenant
* Visual Studio Code (VSCode), current edition
* Node.js >=v20.0.0
* Web browser (the lab is tested with Chrome)

The full instructions for the labs are provided in the course book.
Clone and open this project as a workspace in VSCode; launch VSCode and open the folder.
You will be prompted with a VSCode toast window (popup) to re-open the project in VSCode as a workspace when you first
open the folder.

## Table of Contents

* [Lab_01 - Identity Provider](./Lab_01%20-%20Identity%20Provider/)
* [Lab_02 - Federated Identity](./Lab_02%20-%20Federated%20Identity/)
* Lab_03 - Universal Login
* Lab_04 - Identity Sources
* Lab_05 - User Management
* Lab_06 - API Access Management
* Lab_07 - SPA and Native Apps
* Lab_08 - MFA
* Lab_09 - Passwordless Login
* Lab_10 - Partners
* Lab_11 - Migration Strategies
* Lab_12 - Account Linking Strategies

## License

The project is distributed under the MIT license. You may use and modify all or part of it as you choose, as long as attribution to the source is provided per the license. See the details in the [license file](./LICENSE.md) or at the [Open Source Initiative](https://opensource.org/licenses/MIT).


<hr>
Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.