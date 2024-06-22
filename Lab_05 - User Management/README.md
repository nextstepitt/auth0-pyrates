![Banner Light](./.assets/nsbanner-light.png#gh-light-mode-only)
![banner Dark](./.assets/nsbanner-dark.png#gh-dark-mode-only)

# Customer Identity with OAuth2 and OIDC<br>Lab 04 - Identity Sources

## Overview

This lab explores configuring alternate identity sources in an Auth0 tenant: local, remote, socal and enterprise.

## Lab Overview

This hands-on lab depends on:
* Auth0 administrative account and a development tenant
* Visual Studio Code, current edition
* Node.js >= v20.0.0
* Web browser (the lab is tested with Chrome)

The full instructions for this lab are provided in the course book.
This is an overview of what is accomplished in the lab:

### Prerequisites

1. Completion of the Pyrates and Treasure application integrations in *Lab 02 - Federated Identity*.
1. Enterprise connections require a trial or enterprise tenant, and administrative access for Microsoft Windows.

### Part 1 - Local Database

#### 1.1 - Create the database
1. In the Auth0 tenant go to *Authentication &rarr; Databases* and create a new database connection.
1. Name the connection "Pyrates-Database".
1. Choose email as a user identifier, leave username and phone number off.
1. Ensure that "Disable Signups" is not turned on. 
1. Move to the Applications tab, and add this connection to the Pyrates application.
1. Go to the Pyrates application integration settings and update the ./src/pyrates/.env file with the ISSUER_URL (https://{domain}), CLIENT_ID, and CLIENT_SECRET. 
1. Open the "Lab_04 - Identity Sources" folder in a terminal window, and execute *npm run start-pyrates*.
1. Open http://localhost:3001 in the browser. Click Sign-On. Is the *Sign up* link still on the login page?

#### 1.2 - Sign up new users
1. Click the Sign up link and sign up with "jack.rackham@potc.live" and "P!rates17".
Consent is required only because this application is at localhost.
1. Sign out of the application.
1. In the Auth0 tenant go to *User Management* and find jack.rackham@potc.live.
What connection was the new account created in?
Auth0 always defaults to the oldest connection attached to an application; only one database connection at a time works with an application.
1. Go to the integration for the Pyrates application and on the *Connections* tab disable everything except for the Pyrates-Database connection.
1. In the Pyrates application click the Sign-on link.
1. On the login page do you see *Continue with Google*?
It is not there, the connection is disabled for this application.
1. Click the *Sign up* link and create a new account "charles.vane@potc.live" with "P!rates17".
1. In the Auth0 tenant go to *User Management* and find charles.vane@potc.live.
What connection was the new account created in?
1. Sign out as Charles Vane.
1. Click the *Sign-On* link in the application, and try to log in with "jack.rackham@potc.live".
Does it work?
Jack Rackham is in a connection no longer tied to the application.

#### 1.3 - Multiple applications
1. Open the "Lab_04 - Identity Sources" folder in a new terminal window, and execute *npm run start-treasure*.
1. In the Pyrate application sign in again as Charles Vane.
Click the *Treasure* link to go to that application.
1. What happened?
1. Why can you reach the Treasure application as Charles Vane, when the Treasure application is not linked to the Pyrates-Database connection?
1. Sign out of the application.

#### 1.4 - Restore the connections
1. Go to the integration for the Pyrates application and select the *Connections* tab.
1. Disable the *Pyrates-Database* connection.
1. Re-enable the *Username-Password-Authentication* connection, and the *google-oauth2* connection if it exists.
1. In the Pyrates application click the Sign-on link, and verify that jack.rackham@potc.live can sign in again.
1. Sign out of the application.

### Part 2 - Social Media Connections

#### 2.1 - Social Media Sources

1. In the Auth0 tenant go to *Authentication &rarr; Social*.
1. Note if Google has already been installed as *google-oauth2*, this is currently the default in developer tenants.
1. Click the *+ Create Connection* button.
1. Click on the LinkedIn social connection.
1. Click continue on the consent page.
1. Leave the general settings alone. This will use the internal Auth0 credentials at Linked-In for testing (do not use these for production).
1. In the *Advanced* section ensure that the *Sync user profile attributes at each login* is enabled.
1. Click the *Create* button to build the connection.
1. On the *Applications* tab, choose the Pyrates application.

#### 2.2 - Verify Social Media

1. In the Pyrates application click the sign-on link.
1. Verify which social media providers are offered to the user.
1. Check each provider by clicking on the button; make sure the user is sent to that login page for that provider.
There is no requirement to actually log in using any social provider, you can cancel out of each one.
    1. If Google is enabled, and you keep your browser logged into Google, you will not be asked to be logged in.
Instead, Google will ask for your consent and then you will be signed in to Pyrates as your Google identity.
    1. If you sign in using a social identity, sign out.
Check under user management for the new user.

### Part 3 - Remote Database (optional, depends on ngrok and an ngrok free login)

#### 3.1 - Launch ngrok to map external domain names to the internal applications

1. Open the Lab 04 directory in a new terminal window.
1. Ngrok is installed via Node.js as a local command; the configuration is in *ngrok.yml*.
1. Log into your ngrok account at  https://ngrok.com, or make a free new account there if you wish.
1. On the landing page at ngrok is a command with an auth token in the form: ngrok config add-authtoken xxxxxxxxxxxx
1. Copy the command to the terminal window, but before running it add the option to use the local configuration file: ngrok --config ngrok.yml config add-authtoken xxxxxxxxxxxx
1. Start ngrok with *npm run start-ngrok*.
It is fine if the all the applications are not yet running; you can start, stop, and restart applications that ngrok maps external addresses to.

#### 3.2 - Update the application settings

1. Upate the callback and logout URLs in the Pyrates and Treasure applications to allow the ngrok domains for each (don't forget to add /callback).
1. Test the Pyrates application using the public domain name.

#### 3.2 - Launch the directory service

1. Open another terminal window in Lab 04.
1. Start the directory service API with *npm run identitydb-api*.
1. Verify the directory service by going to both http://localhost:4000, and the public domain mapped to port 4000 (look in the previous terminal window).
1. Note the pyrates defined in the directory service; the password for each is *P!rates17*.

#### 3.3 - Connect to the directory service

1. Navigate to *Authentication &rarr; Database* and create a new database connection *Pyrates-Remote*.
1. Initially configure this the same as in part 1.
1. Move to the *Custom Database* tab.
1. Note there are six action scripts that need to be defined for the custom database: *Login, Create, Verify, Change Password, Get User, and Delete*.
1. The content for these scripts has been provided in the local file *database-action-scripts*, along with the comments (from the Auth0 page) about how to
configure each one. Go over each script, and if you like, go over the code for the identitydb-api.
1. Below the script window there are *secret* variables that may be defined for all the scripts to share:
    1. Define a variable *url* with the public domain ngrok assigned to the identity database api.
    1. Define a second variable *secret* which will authenticate the script to the api with the value *pyrates rule the caribbean*.
1. Copy the login script, sans the instructional comment. Select the login script in Auth0 and paste it, overriding the current content.
1. Click the *Save and Try* button; you should be able to test with the account *henry.morgan@potc.live*.
1. Repeat the process with the five other scripts:
    1. You can add a new user to the database with create, it will show up if you refresh the database page from the last section.
    1. You can test verify on any pyrate, their email verification will change to true.
    1. You can change the password of any pyrate, and the test it using the login script *Save and Try*.
    1. Get user will return the record for a pyrate given the email address.
    1. Delete will delete a user; go ahead and try it; restarting the identitydb-api will reset the database to the original pyrates.

#### 3.4 - Test with the Pyrates application

1. In AUth0 go to the configuration for the Pyrates application.
1. Under *Connections* disable the other database connection, and enable *Pyrates-Remote*.
1. Visit the application and sign on as Henry Morgan.
1. Sign out, and use the sign up to create a new pyrate.
1. Verify the pyrate was created in the page for the identity database API.
1. Sign out.

### Part 4 - Enterprise Connections (optional, requires ngrok and a trial or enterprise Auth0 tenant)

If you did not do part three, or stopped ngrok, launch ngrok following the steps in 3.1.
This part expects that ngrok and the Pyrates application are both running.
It does not matter which database connection is currently configured; either the default or the Pyrates-Remote connection from part 3.

#### 4.1 - Enterprise Sources

1. Under *Authentication &rarr; Authentication Profile* make sure that *Identifier First* is the selected flow.
1. Craete a new Active Directory / LDAP connection.
Use *pyrates.live* as the IdP domain name for login routing.
Note the *Provisioning Ticket URL* on the Setup tab, that will be needed later.
You can always get it from this tab.
1. Click the Mac/Linux link for all platforms, including Microsoft Windows.
Ignore the blue "Install for Windows" button, while it downloads the installer the instructions for all platforms are reached from the preceeding link.

#### 4.2 - Configure the Connector

1. Choose the platform you will use for the connection agent:   
    1. Microsoft Windows:
        1. Download and run the the MSI file installer, it will launch the web interface at port http://localhost:8357.
Wait for it, or click the reload button if it launched before the installation finished.
        1. Provide the provisioning ticket URL from the Auth0 connection setup tab.
        1. On the next page use *ldaps://dev-43633848.ldap.okta.com* as the LDAP Connection String.
        1. Provide *dc=dev-43633848, dc=okta, dc=com* as the Base DN.
        1. The Username is *uid=ldap.bind@pyrates.live, ou=users, dc=dev-43633848, dc=okta, dc=com*, and the Password is *P!rates17*.
        1. Click *Save* and verify the connection: the four tests that appear at the bottom are OK.
        1. Locate and edit the config.json file in *Program Files (x86) &rarr; Auth0 &rarr; AD LDAP Connector*.
    1. Mac / Linux
        1. For Mac/Linux scroll down the page to "Install the connector for other platforms" 
        1. Click the link for "adldap-X.X.X".
        1. Download the zip file of the source.
        1. Expand the directory in the zip file into the Lab_04 directory.
        1. In the directory run *npm install* to 
        1. Run *node server.js* to create the config.json file and start configuration.
        1. Enter the provisioning ticket URL from the Auth0 connection setup tab.
        1. Use *ldaps://dev-43633848.ldap.okta.com* as the LDAP Server URL.
        1. Provide *dc=dev-43633848, dc=okta, dc=com* as the LDAP Server base DN.
        1. The script will tell you to edit the config.json file.
        1. Set the value of the LDAP_BIND_USER attribute to *uid=ldap.bind@pyrates.live, ou=users, dc=dev-43633848, dc=okta, dc=com*.
        1. The password must be set, add the entry "LDAP_BIND_PASSWORD": "P!rates17".
        1. Edit the config.json file.
1. The connector assumes the attribute *cn*, for the Okta LDAP server *uid* is used.
Add the entry *"LDAP_USER_BY_NAME": "(uid={0})"*, to the configuration.
1. Add entries for searching users in the Okta LDAP server:
    1. "LDAP_SEARCH_QUERY": "(&(objectClass=inetOrgPerson)(cn={0}))",
    1. "LDAP_SEARCH_ALL_QUERY": "(objectClass=inetOrgPerson)",
    1. "LDAP_SEARCH_GROUPS": "(&(objectClass=groupOfUniqueNames)(uniqueMember={0}))",
1. The current connector has a problem if group membership is not returned with the user, and Okta does not provide that.
Disable it by adding:
    1. "GROUPS": false
1. In Windows find the service and restart it to get the new configuration; for Mac/Linux run *node server.js*.

#### 4.3 - Application

1. In Auth0 enable the LDAP enterprise connection for the Pyrates application.
1. Test the authentication for the application; make sure the enterprise connection is working.

#### 4.4 - Shutdown

1. Shut down (ctrl-C) the ngrok and Pyrates applications.
1. Close all of the terminal windows.


## License

The project is distributed under the MIT license. You may use and modify all or part of it as you choose, as long as attribution to the source is provided per the license. See the details in the [license file](./LICENSE.md) or at the [Open Source Initiative](https://opensource.org/licenses/MIT).


<hr>
Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.

Antique Pirate Ship photo by Digikhmer Photography is licensed from Dreamscape: ID 60148066 © Digikhmer | Dreamstime.com