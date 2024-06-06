![Banner Light](./.assets/nsbanner-light.png#gh-light-mode-only)
![banner Dark](./.assets/nsbanner-dark.png#gh-dark-mode-only)

# Customer Identity with OAuth2 and OIDC<br>Lab 01 - Identity Provider

## Overview

This hands-on lab starts with the Pyrates web-application.
The goal is to provde the simplest application to follow and learn about Identity as a Service.
Pyrates is an Express application using EJS as the view engine.
The application launches from ./src/pyrates/app.js.
app.js uses *dotenv* to load the externalized configuration into the process environment, and
then injects those values into homeController.js.
The controller establishes an authentication middleware component via the *express-openid-connect* SDK and adds it
to the Express configuration.
Routes for the static assets, favicon.ico, [ /, /index, /index.html ], /profile, and /treasure are configured via Express.
The / and /profile HTML pages are built by EJS using model data passed from the controller functions for the routes.

A suite of five test files defining 41 unit, integration, and acceptance tests are configured for the application.
The tests are built using [*Vitest*](https://vitest.dev/) and [*Puppeteer*](https://pptr.dev/).
These are used but not explored in the lab, and provide a starting point for learning how to test a web application using an
identity provider.

## Lab Overview

This hands-on lab depends on:
* Auth0 administrative account and a development tenant
* Visual Studio Code, current edition
* Node.js >=v20.0.0
* Web browser (the lab is tested with Chrome)

The full instructions for this lab are provided in the course book.
This is an overview of what is accomplished in the lab:

#### 1.1
1. If you have an existing administrator account at Auth0, and you have an existing development tenant to use or you can create a new tenant, then sign in
to your account and use your tenant.
If you do not have an account then register for a free new one at https://auth0.com, this includes a free developer tenant.
1. Configure a web application integration named *Pyrates* in your Auth0 tenant.
1. Complete the .env file in ./src/pyrates with the issuer (Auth0) base URL, client id, and client secret values from the integration.
The ISSUER_BASE_URL is built by prepending https:// to the *Domain* from the application integration.
1. In the Auth0 integration set the allowed callback and logout URLs to match the BASE_URL in the .env file: http://localhost:3000.

#### 1.2
1. Install the sdk with *npm install express-openid-connect*, or use *yarn* if you prefer.
1. After the import for *express-cache-ctrl*, import the auth and requiresAuth functions from the *express-openid-connect* NPM package.
Because the distributed package is built using the CommonJS format, requiresAuth cannot be imported directly.
Import the export object and split it:
    ```js
    import expressOpenIdConnect from 'express-openid-connect'
    const { auth, requiresAuth } = expressOpenIdConnect
    ```
1. After the comment about the express-openid-connect SDK authentiation middleware configuration,
establish a *config* variable using the auth function with the following options:
    ```js
    const authMiddleware = auth({

        authorizationParams: {
            response_type: 'code',
            scope: 'openid profile email'
        },
        authRequired: false,
        baseURL: baseUrl,
        clientID: clientId,
        clientSecret: clientSecret,
        idpLogout: true,
        issuerBaseURL: issuerBaseUrl,
        secret: secret
    })
    ```
1. Following the configuration add the config as middleware to Express:
    ```js
    app.use(authMiddleware)
    ```

#### 1.3
1. Add the *requiresAuth(() = false)* as the first middleware to the route for [ /, /index, /index.html ].
This middlware uses a callback function to indicate (false) that authentication must take place.
This steps outside of the bounds of unit testing, because this is inserted just so the middleware may
be mocked for this route during the test.
This is the only place in the application that anything is added to support testing, everything
else follows the principles of test in isolation and do not write code specificially to enable testing.
1. Add *requiresAuth()* as the first middleware in each of the routes for /profile and /treasure.
Without a parameter the default is *true*, authentication is required for the route.

#### 1.4
1. Run all of the tests with *npm test*, or *npm run test-coverage* to check the code coverage during testing.

#### 1.5
1. Launch the web application server with *npm run start-pyrates*.
1. Open the browser and go to http://localhost:3000, verify the landing page is accessible.
1. Click on the Profile page. Auth0 will provide the login page. Click the sign-up button and create a new account and sign in.
1. Verify the profile page shows the ODIC ID token and the JSON claims that it contains.
1. Click *Sign Out* and verify you are signed out of the application.

## License

The project is distributed under the MIT license. You may use and modify all or part of it as you choose, as long as attribution to the source is provided per the license. See the details in the [license file](./LICENSE.md) or at the [Open Source Initiative](https://opensource.org/licenses/MIT).


<hr>
Copyright © 2024 NextStep IT Training powered by Smallrock. All rights reserved.