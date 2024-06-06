// app.test.js
// Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.
//

import { beforeAll, describe, expect, it, vi } from 'vitest'

describe('homeController', () => {

    it('Launches automatically from the command line', async () => {
        
        process.chdir('./src/pyrates')                  // .env is in the pyrates folder; pool is set to 'forks' in vitest.config.js to allow this.
        delete(process.env.BASE_URL)                    // vitest sets BASE_URL (undocumented) so removing to the the .env setting is the easiest solution.

        // Configure the spy for the homeController.

        const homeController = await import('../../../src/pyrates/homeController')
        const homeControllerSpy = vi.spyOn(homeController, 'default')

        // Setting the argument will cause the application to see execution as starting from the command line.

        process.argv[1] = 'app.js'

        // Importing the module triggers the launch.

        const app = await import('../../../src/pyrates/app')

        app.shutdown();
        
        // dotenv runs during the launch, so these environment values are from the actual launch.

        expect(homeControllerSpy).toBeCalledWith(process.env.ISSUER_BASE_URL, process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.SECRET, process.env.APPLICATION_PORT, process.env.BASE_URL, process.env.TREASURE_URL)
    })
})

export default {}