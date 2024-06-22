// homeController.js
// Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.
//

import express from 'express'
import cache from 'express-cache-ctrl'
import { hash as bcryptHash, verify as bcryptVerify } from '@node-rs/bcrypt'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const bcryptSaltRounds = 10

let appServer = null

const pyrates = [

    { _id: 'acdcd7f6-10f1-4030-a5f8-73da8000bceb', firstName: 'William', lastName: 'Kidd', email: 'william.kidd@potc.live', email_verified: false, ship: 'Adventure Galley', password: '$2y$10$7y6cKqJ/9sVFLqW9sIEk9ea0oegcNNeFjppAh3KlEpC1SPKlNvmni' },
    { _id: '35059dc7-5d89-44b5-b191-6e31820ac6e3', firstName: 'Henry', lastName: 'Morgan', email: 'henry.morgan@potc.live', email_verified: false, ship: 'Satisfaction', password: '$2y$10$7y6cKqJ/9sVFLqW9sIEk9ea0oegcNNeFjppAh3KlEpC1SPKlNvmni' },
    { _id: '63baab34-263f-4424-bec2-6ead385e69f9', firstName: 'Henry', lastName: 'Jennings', email: 'henry.jennings@potc.live', email_verified: false, ship: 'Bersheba', password: '$2y$10$7y6cKqJ/9sVFLqW9sIEk9ea0oegcNNeFjppAh3KlEpC1SPKlNvmni' },
    { _id: '09dc6d7b-fad2-449d-9130-384477138753', firstName: 'Ned', lastName: 'Low', email: 'ned.low@potc.live', email_verified: false, ship: 'Fancy', password: '$2y$10$7y6cKqJ/9sVFLqW9sIEk9ea0oegcNNeFjppAh3KlEpC1SPKlNvmni' },
];

const homeController = async (applicationPort, baseUrl, secret) => {

    const authenticationSuccess = async (request, response, pyrate) => {

        let result = false
        let authorization = request.header('Authorization')
        let credentials = null

        if (authorization) {
            
            const index = authorization.toLowerCase().indexOf('basic ')

            if (index === 0) {

                const decodedString = Buffer.from(authorization.substring(5), 'base64').toString('utf-8');
                const [ username, password ] = decodedString.split(':')

                credentials = password
            }
        }

        if (credentials && ((secret === credentials) || (pyrate && await bcryptVerify(credentials, pyrate.password)))) {
            
            result = true
        }

        if (!result) {

            response.statusMessage = 'Access denied'
            response.status(401).end()
        }

        return result
    }
    
    const app = express()
    const iconPath = path.join(import.meta.dirname, 'assets/images/favicon.ico')

    // Add JSON middleware to handle JSON in requests.

    app.use(express.json())

    // Set the view compilation engine to EJS.

    app.set('view engine', 'ejs')
    
    // Anything out of /assets is static.

    app.use('/assets', express.static('./assets'))
    
    // Handle the favorite icon.

    app.use('/favicon.ico', cache.disable(), (request, response, next) => {

        response.sendFile(iconPath)
    })

    // Public landing page.

    app.get([ '/', '/index', '/index.html' ], cache.disable(), (request, response, next) => {

        response.render('pages/index', { pyrates: pyrates })
    })

    // Delete user.

    app.delete('/pyrates/:pyrate', cache.disable(), async (request, response, next) => {

        if (await authenticationSuccess(request, response)) {

            const index = pyrates.findIndex((pyrate) => request.params.pyrate.indexOf('@') >= 0 ? pyrate.email === request.params.pyrate : pyrate._id === request.params.pyrate)

            if (index < 0) {

                response.statusMessage = 'Not found'
                response.status(404).end()
            
            } else {

                pyrates.splice(index, 1)
                response.status(202).end()
            }
        }
    })

    // Read users: return a JSON list of all the users, sanitized to remove secure information (passwords).

    app.get('/pyrates', cache.disable(), async (request, response, next) => {

        if (await authenticationSuccess(request, response)) {

            const pyratesSecure = pyrates.map(pyrate => { return { _id: pyrate._id, email: pyrate.email, email_verified: pyrate.email_verified, firstName: pyrate.firstName, lastName: pyrate.lastName, ship: pyrate.ship }})

            response.setHeader('content-type', 'application/json')
            response.status(200).end(JSON.stringify(pyratesSecure))
        }
    })

    // Read user

    app.get('/pyrates/:pyrate', cache.disable(), async (request, response, next) => {

        const pyrate = pyrates.find(pyrate => request.params.pyrate.indexOf('@') >= 0 ? pyrate.email === request.params.pyrate : pyrate._id === request.params.pyrate)

        if (await authenticationSuccess(request, response, pyrate)) {

            if (!pyrate) {

                response.statusMessage = 'Not found'
                response.status(404).end()
            
            } else {

                const pyrateSecure = { _id: pyrate._id, email: pyrate.email, email_verified: pyrate.email_verified, firstName: pyrate.firstName, lastName: pyrate.lastName, ship: pyrate.ship }

                response.setHeader('content-type', 'application/json')
                response.status(200).end(JSON.stringify(pyrateSecure))
            }
        }
    })

    // Create user.

    app.post('/pyrates', cache.disable(), async (request, response, next) => {

        if (await authenticationSuccess(request, response)) {

            if (!request.body || !request.body.email) {

                response.statusMessage = 'Invalid requiest format'
                response.status(400).end()
            
            } else {

                const pyrate = pyrates.find((pyrate) => pyrate.email === request.body?.email)

                if (pyrate) {

                    response.statusMessage = 'Duplicate entity'
                    response.status(409).end()
                
                } else {

                    const pyrate = { _id: uuidv4(), email: request.body.email}

                    if (request.body.firstName) {

                        pyrate.firstName = request.body.firstName
                    }
        
                    if (request.body.lastName) {
        
                        pyrate.lastName = request.body.lastName
                    }
        
                    if (request.body.email_verified) {
        
                        pyrate.email_verified = request.body.email_verified
                    }

                    if (request.body.ship) {

                        pyrate.ship = request.body.ship
                    }

                    if (request.body.password) {

                        try {

                            pyrate.password = await bcryptHash(request.body.password, bcryptSaltRounds)
                            pyrates.push(pyrate)
                            response.status(201).end(JSON.stringify({ _id: pyrate._id }))
                        }

                        catch (err) {

                            response.statusMessage = 'Internal server error'
                            response.status(500).end()
                        }
                    
                    } else {

                        pyrates.push(pyrate)
                        response.status(201).end(JSON.stringify({ _id: pyrate._id }))
                    }
                }
            }
        }
    })

    // Update user.

    app.put('/pyrates/:pyrate', cache.disable(), async (request, response, next) => {

        const pyrate = pyrates.find((pyrate) => request.params.pyrate.indexOf('@') >= 0 ? pyrate.email === request.params.pyrate : pyrate._id === request.params.pyrate)

        if (await authenticationSuccess(request, response, pyrate)) {

            if (!pyrate) {

                response.statusMessage = 'Not found'
                response.status(404).end()           

            } else if (!request.body || Object.keys(request.body).length == 0) {

                response.statusMessage = 'Invalid requiest format'
                response.status(400).end()
            
            } else {

                if (request.body.email) {

                    // Note the lookup is by params.email; this allows the email to be updated.

                    pyrate.email = request.body.email
                }

                if (request.body.firstName) {

                    pyrate.firstName = request.body.firstName
                }

                if (request.body.lastName) {

                    pyrate.lastName = request.body.lastName
                }

                if (request.body.email_verified) {

                    pyrate.email_verified = request.body.email_verified
                }

                if (request.body.ship) {

                    pyrate.ship = request.body.ship
                }

                if (request.body.password) {

                    try {

                        pyrate.password = await bcryptHash(request.body.password, bcryptSaltRounds)
                        response.status(202).end()
                    }

                    catch (err) {

                        response.statusMessage = 'Internal server error'
                        response.status(500).end()
                    }
                
                } else {

                    response.status(200).end(JSON.stringify({ _id: pyrate._id }))
                }
            }
        }
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