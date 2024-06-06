// homeController.js
// Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.
//

import express from 'express'
import cache from 'express-cache-ctrl'
import expressOpenIdConnect from 'express-openid-connect'
const { auth, requiresAuth } = expressOpenIdConnect
import path from 'path'

let appServer = null

const homeController = (issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, treasureUrl) => {

    const app = express()
    const iconPath = path.join(import.meta.dirname, 'assets/images/favicon.ico')

    // Set the view compilation engine to EJS.

    app.set('view engine', 'ejs')

    // Configure the express-openid-connect SDK authentication middleware object. SSUER_BASE_URL, BASE_URL, CLIENT_ID,
    // CLIENT_SECRET, and SECRET will picked up automatically from the environment, but good software design prinsiples 
    // dictate we should not let that happen and use the injected values.

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

    app.use(authMiddleware)
    
    // Anything out of /assets is static.

    app.use('/assets', express.static('./assets'))
    
    // Handle the favorite icon.

    app.use('/favicon.ico', cache.disable(), (request, response, next) => {

        response.sendFile(iconPath)
    })

    // Public landing page.

    app.get([ '/', '/index', '/index.html' ], requiresAuth(() => false), cache.disable(), (request, response, next) => {
        
        response.render('pages/index', { isAuthenticated: request.oidc.isAuthenticated(), avatar: request.oidc.user?.picture })
    })

    // /logout is registered and handled by the express-openid-connect middleware.

    // The profile page is built into the portal.

    app.get('/profile', requiresAuth(), cache.disable(), (request, response, next) => {

        response.render('pages/profile', { isAuthenticated: request.oidc.isAuthenticated(), avatar: request.oidc.user?.picture, idToken: request.oidc.idToken, rawClaims: JSON.stringify(request.oidc.user, null, 4) })
    })

    // Treasure (separate application, currently not implemented).

    app.get('/treasure', requiresAuth(), cache.disable(), (request, response, next) => {

        response.redirect(treasureUrl)
    })

    appServer = app.listen(applicationPort)
    console.log(`Pyrates application listening on port ${applicationPort}: visit http://localhost:${applicationPort}`)
}

const shutdown = () => {

    // This performs a clean shutdown of the express router.

    appServer?.close()
}

export default homeController
export { shutdown }