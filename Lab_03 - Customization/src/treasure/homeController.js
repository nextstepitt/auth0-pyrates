// homeController.js
// Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.
//

import express from 'express'
import cache from 'express-cache-ctrl'
import expressOpenIdConnect from 'express-openid-connect'
const { auth, requiresAuth } = expressOpenIdConnect
import session from 'express-session'
import initMemoryStore from 'memorystore'
import path from 'path'

let appServer = null

const homeController = (issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, pyratesUrl) => {

    const app = express()
    const iconPath = path.join(import.meta.dirname, 'assets/images/favicon.ico')

    // Set the view compilation engine to EJS.

    app.set('view engine', 'ejs')

    // Auth0 back-channel logout support depends on the session store. Note: memoryStore exports a function
    // that needs to be called with the express-session export to return a ctor to create the session store!

    const sessionStore = new (initMemoryStore(session))({ checkPeriod: 86400000 })

    const sessionMiddleware = session({
        secret: secret,
        resave: true,
        saveUninitialized: true,
        store: sessionStore
    })

    app.use(sessionMiddleware)

    // Configure the express-openid-connect SDK authentication middleware object. SSUER_BASE_URL, BASE_URL, CLIENT_ID,
    // CLIENT_SECRET, and SECRET will picked up automatically from the environment, but good software design prinsiples 
    // dictate we should not let that happen and use the injected values.

    const authMiddleware = auth({

        authorizationParams: {
            response_type: 'code',
            scope: 'openid profile email'
        },
        authRequired: false,
        backchannelLogout: { store: sessionStore },
        baseURL: baseUrl,
        clientID: clientId,
        clientSecret: clientSecret,
        idpLogout: true,
        issuerBaseURL: issuerBaseUrl,
        routes: {
            postLogoutRedirect: pyratesUrl
        },
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

    app.get([ '/', '/index', '/index.html' ], requiresAuth(), cache.disable(), (request, response, next) => {

        const treasure = [

            { _id: 'acdcd7f6-10f1-4030-a5f8-73da8000bceb', date: '1695', amount: 600000, prize: 'Ganj-i-Sawai', ship: 'Fancy', captain: 'Long Ben' },
            { _id: '35059dc7-5d89-44b5-b191-6e31820ac6e3', date: '1693', amount: 180000, prize: 'Unknown dhow', ship: 'Amity', captain: 'The Rhode Island Pirate' },
            { _id: '63baab34-263f-4424-bec2-6ead385e69f9', date: '1723', amount: 15000, prize: 'Nostra Signiora de Victoria', ship: 'Squirrel', captain: 'Ned Low' },
            { _id: '0bc78240-5110-4191-8448-bf1769da191b', date: '1721', amount: 2700, prize: 'Unknown slaver', ship: 'Unknown brigatine', captain: 'Charles Vane' },
            { _id: '09dc6d7b-fad2-449d-9130-384477138753', date: '1723', amount: 150, prize: 'Fortune', ship: 'Fancy', captain: 'Ned Low' },
        ];

        response.render('pages/index', { isAuthenticated: request.oidc.isAuthenticated(), avatar: request.oidc.user?.picture, returnTo: pyratesUrl, treasure: treasure })
    })

    // /logout is registered and handled by the express-openid-connect middleware.

    // Treasure (separate application, currently not implemented).

    app.get('/pyrates', cache.disable(), (request, response, next) => {

        response.redirect(pyratesUrl)
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