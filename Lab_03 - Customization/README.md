![Banner Light](./.assets/nsbanner-light.png#gh-light-mode-only)
![banner Dark](./.assets/nsbanner-dark.png#gh-dark-mode-only)

# Customer Identity with OAuth2 and OIDC<br>Lab 03 - Customization

## Overview

This lab explores customization/branding of the authentication experience.
The goal is to show how an identity provider offers a consistent authentication experience regardless
of which application the user is landing on.

## Lab Overview

This hands-on lab depends on:
* Auth0 administrative account and a development tenant
* Visual Studio Code, current edition
* Node.js >=v20.0.0
* Web browser (the lab is tested with Chrome)

The full instructions for this lab are provided in the course book.
This is an overview of what is accomplished in the lab:

### Prerequisites

1. Completion of the Pyrates and Treasure application integrations in *Lab 02 - Federated Identity*.

#### 1.1 - The Logo
1. The logo, the support email address and support URL are managed under the tenant settings.
In your Auth0 tenant click on the Settings option at the bottom of the navigation menu and scroll to "Settings".
1. Change the logo URL to this image hosted at GitHub: https://nextstepitt.github.io/auth0-pyrates/assets/images/jolly-roger.jpg. Save the changes.

#### 1.2 - Explore customization
1. Move to the Branding option in the navigation menu: here are the options to configure SMS and email services, and configure the sms and email message templates.
1. A custom domain is a must to hide the *.auth0.com domain from your customers.
1. Click the Universal Login option to customize the login page.
1. Click on the Advanced Options button at the bottom of the page.
1. On the Settings tab under Universal Login Experience ensure "New" is selected; this is necessary for password-less authentication with passkeys.
1. Click on the Custom Text page the text for the login page can be changed; note that language selection is a drop-down list at the upper left. Customize this if you choose.
1. Click the Branding navigation and Universal Login again to customize the login page.
1. Click the Customization Options button in the middle of the page.
1. In the Styles list at the left click on the Page Background at the end.
1. In the page layout option at the right change the dialog position to the right (third button).
1. Set the background color to #1C2242.
1. Set the Logo URL to https://nextstepitt.github.io/auth0-pyrates/assets/images/pyrate-sunset.jpg.
1. Save the changes.
1. Click the Try button at the upper right to preview the changes.
1. Make any other changes to the font, font size, and style if you choose.

#### 1.3 - Test the applications
1. From the Pyrates application integration settings update the ./src/pyrates/.env file with the ISSUER_URL (https://{domain}), CLIENT_ID, and CLIENT_SECRET. 
1. From the Treasure application integration settings update the ./src/treasure/.env file with the ISSUER_URL (https://{domain}), CLIENT_ID, and CLIENT_SECRET.
1. Open the "Lab_03 - Customization" folder in a terminal window, and execute *npm run start-pyrates*.
1. Open the "Lab 03 - Customization" folder in a second terminal window, and execute *npm run start-treasure*.
1. Open a browser and go to http://localhost:3000.
1. Make sure you are signed out and see the Sign-On menu link.
1. Click on the Sign-On menu link, and check the login screen to make sure it matches your changes.
Do not sign on.
1. Open http://localhost:3001 in the browser.
1. The login page should have opened because you must be authenticated to access the Treasure application.
1. Ensure that the login page looks the same as it did for the Pyrates application.
This is the point of federated authentication with and identity provider; no matter what application you start with you get a consistent path.

#### 1.4 - Shutdown

1. Shut down (ctrl-C) both applications the two three terminal windows.
1. Close all of the terminal windows.

## License

The project is distributed under the MIT license. You may use and modify all or part of it as you choose, as long as attribution to the source is provided per the license. See the details in the [license file](./LICENSE.md) or at the [Open Source Initiative](https://opensource.org/licenses/MIT).


<hr>
Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.

Antique Pirate Ship image by Digikhmer Photography is licensed for from Dreamscape: ID 60148066 © Digikhmer | Dreamstime.com