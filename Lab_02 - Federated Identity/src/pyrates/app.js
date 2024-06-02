// app.js
// Copyright © 2024 NextStep IT Training. All rights reserved.
//

import { config as dotenvConfig } from 'dotenv'
import path from 'path'

import homeController, { shutdown as homeControllerShutdown } from './homeController.js'

const launch = () => {

    // Inject the base, client id, client secret, and applicaiton port into the controller.

    dotenvConfig()
    homeController(process.env.ISSUER_BASE_URL, process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.SECRET, process.env.APPLICATION_PORT, process.env.BASE_URL, process.env.TREASURE_URL)
}

const shutdown = () => {

    // Shutdown the homecontroller request loop.

    homeControllerShutdown()
}

if (path.basename(process.argv[1]) === 'app.js') {

    // The application was invoked from the command line

    launch()
}

export { launch, shutdown }