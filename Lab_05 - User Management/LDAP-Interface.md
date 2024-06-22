![Banner Light](./.assets/nsbanner-light.png#gh-light-mode-only)
![banner Dark](./.assets/nsbanner-dark.png#gh-dark-mode-only)

# Okta LDAP Interface Configuration for Auth0 Enterprise Connector

## Overview

How to set up the Okta LDAP interface and configure security to provide the LDAP pyrates directory service for an enterprise connector example.
There are several related things that need to be considered:
* How to configure the LDAP interface
* The pyrates who authenticate through LDAP have exposed passwords for the demo
* The read-only administrative user necessary to bind to LDAP also has an exposed password
* Block all non-administrators from the dashboard
* Require MFA for all dashboard and administrative access
* Bypass any MFA for the LDAP interface (LDAP supports MFA, but it is not used for the demo)

## Instructions
### LDAP Interface

* Enable the LDAP interface from *Directory &rarr; Directory Integrations*.
* Select all of the default options.
* Note: only the true Okta domain name (*.[okta,okta-emea,oktapreview].com) can be used to serve for the LDAP interface.
* Note the domain name: the path will appear in the form ldaps://dev-43633848.okta.com, this is needed for the Auth0 LDAP Connector configuration.
We will use this domain name in the examples below.

### LDAP Bind User

* The connector needs a user with read-only administrative privileges for performing seraches: bind and search requests.
* Create a group *LDAP Read-Only*. Assign this group read-only administrative privileges.
* Create a new user LDAP BIND; ldap.bind@pyrates.live. Assign it to the *LDAP Read-Only* group and a permanent password of *P!rates17*.
* Note that under this configuration, this user has a path of *uid=ldap.bind@pyrates.live, dc=dev-43633848, dc=okta, dc=com*.
Okta serves users as instances of *inetOrgPerson* with the attribute *uid* instead of *cn*.

### Authenticators

* Add any authenticators you want administrators to use; Okta verify and FIDO2 authenticators are excellent choices.
* Create an enrollment policy for the Okta administrators group to restrict the authenticators they may enroll in.
Make all of the authenticators optional.
An often-missed point in the enrollment policy is even if all authenticators are optional, if the user needs an authenticator to
get to an application (in this case the dashboard and admin control panel), enrollment becomes required.
* If you want, only allow enrollment from specific locations (enterprise network) and block it from everywhere else.

### Global Security Policy

* Add a global security policy for LDAP, this will be first in the list.
Target everyone.
The rule should requires password and does not require MFA.
Since an LDAP authentication is not targeting an application, MFA will never be required.
MFA does work with LDAP, removing it here is for the purposes of the demonstration so users do not have to be enrolled.
* Add another GSP for Okta administrators that does not require a password (admins can use other authenticators) but does require MFA in all circumstances.

### Authentication Policies

* If the Okta Dashboard is tied to a policy with other applications, separate it into its own policy.
    * Make a rule for Administrators that requires two authenticators for accessing the application.
    * Change the catch-all to deny access to anyone else.
* The Admin Console should also have its own policy.
    * Duplicate the rule setup from the policy for the dashboard.
    * Add an exclusion to the administrators rule for the ldap.bind@pyrates.live user to make them fall through and be denied by the catch-all. 

### Wrapup

* Make sure that only the administrators (and not ldap.bind@pyrates.live) can reach the dashboard and admin console.
* Complete the configuration of the Auth0 enterprise authenticator and make sure the pyrates can authenticate through that.

## License

The project is distributed under the MIT license. You may use and modify all or part of it as you choose, as long as attribution to the source is provided per the license. See the details in the [license file](./LICENSE.md) or at the [Open Source Initiative](https://opensource.org/licenses/MIT).


<hr>
Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.

Antique Pirate Ship photo by Digikhmer Photography is licensed from Dreamscape: ID 60148066 © Digikhmer | Dreamstime.com