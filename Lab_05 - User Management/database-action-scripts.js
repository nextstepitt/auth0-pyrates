// database-action-scripts.js
// Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.
//
// For reference these functions include the original isntructions from the core templates in each of of the
// six actions: Login, Create, Verify, Change Password, Get User, Delete.
//

// Login
// 
// Dependencies - set these variables under "Database settings":
//
//  "url": the ngrok HTTPS URL for the identitydb-api instance
//
// Original core template instructions:
//
// This script should authenticate a user against the credentials stored in
// your database.
// It is executed when a user attempts to log in or immediately after signing
// up (as a verification that the user was successfully signed up).
//
// Everything returned by this script will be set as part of the user profile
// and will be visible by any of the tenant admins. Avoid adding attributes
// with values such as passwords, keys, secrets, etc.
//
// The `password` parameter of this function is in plain text. It must be
// hashed/salted to match whatever is stored in your database. For example:
//
//     var bcrypt = require('bcrypt@0.8.5');
//     bcrypt.compare(password, dbPasswordHash, function(err, res)) { ... }
//
// There are three ways this script can finish:
// 1. The user's credentials are valid. The returned user profile should be in
// the following format: https://auth0.com/docs/users/normalized/auth0/normalized-user-profile-schema
//     var profile = {
//       user_id: ..., // user_id is mandatory
//       email: ...,
//       [...]
//     };
//     callback(null, profile);
// 2. The user's credentials are invalid
//     callback(new WrongUsernameOrPasswordError(email, "my error message"));
//
//    Note: Passing no arguments or a falsey first argument to
//    `WrongUsernameOrPasswordError` will result in the error being logged as
//    an `fu` event (invalid username/email) with an empty string for a user_id.
//    Providing a truthy first argument will result in the error being logged
//    as an `fp` event (the user exists, but the password is invalid) with a
//    user_id value of "auth0|<first argument>". See the `Log Event Type Codes`
//    documentation for more information about these event types:
//    https://auth0.com/docs/deploy-monitor/logs/log-event-type-codes
// 3. Something went wrong while trying to reach your database
//     callback(new Error("my error message"));
//
// A list of Node.js modules which can be referenced is available here:
//
//    https://tehsis.github.io/webtaskio-canirequire/
//

async function login(email, password, callback) {

    const fetch = require('node-fetch@2.6.1');
    const base64Creds = Buffer.from(`${email}:${password}`).toString('base64');
    const response = await fetch(`${configuration.url}/pyrates/${email}`, {
        method: 'GET',
        headers: {
            'Authorization': `basic ${base64Creds}`
        }
    });

    switch (response.status) {

        case 200:
            const remoteProfile = await response.json();
            const profile = {

                user_id: remoteProfile._id,
                email: remoteProfile.email,
                email_verified: remoteProfile.email_verified,
                firstName: remoteProfile.firstName,
                lastName: remoteProfile.lastName,
                user_metadata: {
                    ship: remoteProfile.ship
                }
            };

            callback(null, profile);
            break;

        case 401:
            callback(new WrongUsernameOrPasswordError(email, response.statusText));
            break;

        default:
            callback(new Error(response.statusText));
            break;
    }
}

// Create
// 
// Dependencies - set these variables under "Database settings":
//
//  "url": the ngrok HTTPS URL for the identitydb-api instance
//  "secret": the secret credentials to authenticate with the identitydb-api instance
//
// Original core template instructions:
//
// This script should create a user entry in your existing database. It will
// be executed when a user attempts to sign up, or when a user is created
// through the Auth0 dashboard or API.
// When this script has finished executing, the Login script will be
// executed immediately afterwards, to verify that the user was created
// successfully.
//
// The user object will always contain the following properties:
// * email: the user's email
// * password: the password entered by the user, in plain text
// * tenant: the name of this Auth0 account
// * client_id: the client ID of the application where the user signed up, or
//              API key if created through the API or Auth0 dashboard
// * connection: the name of this database connection
//
// There are three ways this script can finish:
// 1. A user was successfully created
//     callback(null);
// 2. This user already exists in your database
//     callback(new ValidationError("user_exists", "my error message"));
// 3. Something went wrong while trying to reach your database
//     callback(new Error("my error message"));
//

async function login(user, callback) {

    const fetch = require('node-fetch@2.6.1');
    const base64Creds = Buffer.from(`:${configuration.secret}`).toString('base64');
    const response = await fetch(`${configuration.url}/pyrates`, {
        method: 'POST',
        headers: {
            'Authorization': `basic ${base64Creds}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: user.email,
            password: user.password
        })
    });

    switch (response.status) {

        case 201:
            callback(null); // login is called immediately; we can ignore the _id because it will be picked up there.
            break;

        case 401:
            callback(new Error(response.statusText));
            break;

        case 409:
            callback(new Error(response.statusText));
            break;

        default:
            callback(new Error(response.statusText));
            break;
    }
}

// Verify
// 
// Dependencies - set these variables under "Database settings":
//
//  "url": the ngrok HTTPS URL for the identitydb-api instance
//  "secret": the secret credentials to authenticate with the identitydb-api instance
//
// Original core template instructions:
//
// This script should mark the current user's email address as verified in
// your database.
// It is executed whenever a user clicks the verification link sent by email.
// These emails can be customized at https://manage.auth0.com/#/emails.
// It is safe to assume that the user's email already exists in your database,
// because verification emails, if enabled, are sent immediately after a
// successful signup.
//
// There are two ways that this script can finish:
// 1. The user's email was verified successfully
//     callback(null, true);
// 2. Something went wrong while trying to reach your database:
//     callback(new Error("my error message"));
//
// If an error is returned, it will be passed to the query string of the page
// where the user is being redirected to after clicking the verification link.
// For example, returning `callback(new Error("error"))` and redirecting to
// https://example.com would redirect to the following URL:
//     https://example.com?email=alice%40example.com&message=error&success=false
//

async function verify(email, callback) {

    const fetch = require('node-fetch@2.6.1');
    const base64Creds = Buffer.from(`:${configuration.secret}`).toString('base64');
    const response = await fetch(`${configuration.url}/pyrates/${email}`, {
        method: 'PUT',
        headers: {
            'Authorization': `basic ${base64Creds}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email_verified: true
        })
    });

    switch (response.status) {

        case 202:
            callback(null);
            break;

        case 401:
            callback(new WrongUsernameOrPasswordError(email, response.statusText));
            break;

        default:
            callback(new Error(response.statusText));
            break;
    }
}

// Change Password
// 
// Dependencies - set these variables under "Database settings":
//
//  "url": the ngrok HTTPS URL for the identitydb-api instance
//  "secret": the secret credentials to authenticate with the identitydb-api instance
//
// Original core template instructions:
//
// This script should change the password stored for the current user in your
// database. It is executed when the user clicks on the confirmation link
// after a reset password request.
// The content and behavior of password confirmation emails can be customized
// here: https://manage.auth0.com/#/emails
// The `newPassword` parameter of this function is in plain text. It must be
// hashed/salted to match whatever is stored in your database.
//
// There are three ways that this script can finish:
// 1. The user's password was updated successfully:
//     callback(null, true);
// 2. The user's password was not updated:
//     callback(null, false);
// 3. Something went wrong while trying to reach your database:
//     callback(new Error("my error message"));
//
// If an error is returned, it will be passed to the query string of the page
// where the user is being redirected to after clicking the confirmation link.
// For example, returning `callback(new Error("error"))` and redirecting to
// https://example.com would redirect to the following URL:
//     https://example.com?email=alice%40example.com&message=error&success=false
//

async function changePassword(email, newPassword, callback) {

    const fetch = require('node-fetch@2.6.1');
    const base64Creds = Buffer.from(`:${configuration.secret}`).toString('base64');
    const response = await fetch(`${configuration.url}/pyrates/${email}`, {
        method: 'PUT',
        headers: {
            'Authorization': `basic ${base64Creds}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: newPassword
        })
    });

    switch (response.status) {

        case 202:
            callback(null, true);
            break;

        case 401:
            callback(new WrongUsernameOrPasswordError(email, response.statusText));
            break;

        default:
            callback(new Error(response.statusText));
            break;
    }
}

// Get User
// 
// Dependencies - set these variables under "Database settings":
//
//  "url": the ngrok HTTPS URL for the identitydb-api instance
//  "secret": the secret credentials to authenticate with the identitydb-api instance
//
// Original core template instructions:
//
// This script should retrieve a user profile from your existing database,
// without authenticating the user.
// It is used to check if a user exists before executing flows that do not
// require authentication (signup and password reset).
//
// There are three ways this script can finish:
// 1. A user was successfully found. The profile should be in the following
// format: https://auth0.com/docs/users/normalized/auth0/normalized-user-profile-schema.
//     callback(null, profile);
// 2. A user was not found
//     callback(null);
// 3. Something went wrong while trying to reach your database:
//     callback(new Error("my error message"));
//

async function getByEmail(email, callback) {

    const fetch = require('node-fetch@2.6.1');
    const base64Creds = Buffer.from(`:${configuration.secret}`).toString('base64');
    const response = await fetch(`${configuration.url}/pyrates/${email}`, {
        method: 'GET',
        headers: {
            'Authorization': `basic ${base64Creds}`
        }
    });

    switch (response.status) {

        case 200:
            const remoteProfile = await response.json();
            const profile = {

                user_id: remoteProfile._id,
                email: remoteProfile.email,
                email_verified: remoteProfile.email_verified,
                firstName: remoteProfile.firstName,
                lastName: remoteProfile.lastName,
                user_metadata: {
                    ship: remoteProfile.ship
                }
            };

            callback(null, profile);
            break;

        case 401:
            callback(new WrongUsernameOrPasswordError(email, response.statusText));
            break;

        default:
            callback(new Error(response.statusText));
            break;
    }
}

// Delete
// 
// Dependencies - set these variables under "Database settings":
//
//  "url": the ngrok HTTPS URL for the identitydb-api instance
//  "secret": the secret credentials to authenticate with the identitydb-api instance
//
// Notes:
//  * The id is the id of the user from the data store, not the user id in Auth0; another
//      way to say that is the 'auth0|' part is stripped off from the Auth0 id.
//
// Original core template instructions:
//
// This script remove a user from your existing database.
// It is executed whenever a user is deleted from the API or Auth0 dashboard.
//
// There are two ways that this script can finish:
// 1. The user was removed successfully:
//     callback(null);
// 2. Something went wrong while trying to reach your database:
//     callback(new Error("my error message"));
//

async function remove(id, callback) {

    const fetch = require('node-fetch@2.6.1');
    const base64Creds = Buffer.from(`:${configuration.secret}`).toString('base64');
    const response = await fetch(`${configuration.url}/pyrates/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `basic ${base64Creds}`
        }
    });

    switch (response.status) {

        case 202:
            callback(null);
            break;

        default:
            callback(new Error(response.statusText));
            break;
    }
}