// app.test.js
// Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.
//

import { beforeAll, describe, expect, it, vi } from 'vitest'

// Hoist the common definitions for mocking (this must be outside of any function).

const mocks = vi.hoisted(() => {

    return {

        dotenvMock: {

            config: vi.fn(() => {

                process.env.APPLICATION_PORT = '9999'
                process.env.BASE_URL = 'http://localhost:9999/'
                process.env.CLIENT_ID = 'fake-client-id'
                process.env.CLIENT_SECRET = 'fake-client-secret'
                process.env.ISSUER_BASE_URL = 'https://wonderfulwidgets.us.auth0.com'
                process.env.SECRET = 'fake-secret'
                process.env.TREASURE_URL = 'http://localhost:9998/'
            })
        },

        homeControllerMock: {

            default: vi.fn()
        }
    }
})

describe('homeController', () => {

    beforeAll(() =>{

        vi.mock('dotenv', () => mocks.dotenvMock)
        vi.mock('../../../src/pyrates/homeController', () => mocks.homeControllerMock)
    })

    it('Launches automatically from the command line', async () => {

        process.argv[1] = 'app.js'

        const app = await import('../../../src/pyrates/app')
        
        expect(mocks.homeControllerMock.default).toBeCalledWith(process.env.ISSUER_BASE_URL, process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.SECRET, process.env.APPLICATION_PORT, process.env.BASE_URL, process.env.TREASURE_URL)
    })
})

export default {}