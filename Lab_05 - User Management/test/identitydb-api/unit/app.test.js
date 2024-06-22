// app.test.js
// Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.
//

import { beforeAll, describe, expect, it, vi } from 'vitest'

import { launch as appLaunch } from '../../../src/identitydb-api/app'

// Hoist the common definitions for mocking (this must be outside of any function).

const mocks = vi.hoisted(() => {

    return {

        dotenvMock: {

            config: vi.fn(() => {

                process.env.APPLICATION_PORT = '9999'
                process.env.BASE_URL = 'http://localhost:9999/'
                process.env.SECRET = 'fake-secret'
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
        vi.mock('../../../src/identitydb-api/homeController', () => mocks.homeControllerMock)
    })

    it('Initializes the home controller injecting the correct environment variables', async () => {

        appLaunch()
        expect(mocks.homeControllerMock.default).toBeCalledWith(process.env.APPLICATION_PORT, process.env.BASE_URL, process.env.SECRET)
    })
})

export default {}