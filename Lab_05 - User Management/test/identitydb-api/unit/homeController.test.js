// homeController.test.js
// Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.
//

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import homeController, { shutdown } from '../../../src/identitydb-api/homeController'

// Hoist the common definitions for mocking (this must be outside of any function).

const mocks = vi.hoisted(() => {

    const expectedBcryptHashMockValue = '$2b'
    const expectedBcryptErrorMockValue = 'error'
    const expectedBcryptVerifyMockValue = 'true'
    const expectedStaticMockValue = 1234
    const expectedCacheDisableMockValue = 5678
    const expectedJsonMockValue = 9012
    const expectedUuidMockValue = 'abc'

    const appMock = {

        listen: vi.fn(),
        delete: vi.fn(),
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        set: vi.fn(),
        use: vi.fn()
    }

    const mocks = {

        appMock: appMock,

        expectedBcryptHashMockValue: expectedBcryptHashMockValue,
        expectedBcryptErrorMockValue: expectedBcryptErrorMockValue,
        expectedBcryptVerifyMockValue: expectedBcryptVerifyMockValue,
        bcryptMock: {

            default: {

                compare: vi.fn((candidatePassword, actualPassword, callback) => {

                    callback(expectedBcryptMockError, expectedBcryptMockValue)
                }),

                hash: vi.fn((password, rounds, callback) => {

                    callback(expectedBcryptMockError, expectedBcryptMockValue)
                })
            }
        },

        expectedJsonMockValue: expectedJsonMockValue,
 
        expectedStaticMockValue: expectedStaticMockValue,                
        expressMock: {

            default: vi.fn(() => {

                return appMock
            })
        },

        expectedCacheDisableMockValue: expectedCacheDisableMockValue,
        expressCacheCtrlMock: {

            default: {

                disable: vi.fn(() => expectedCacheDisableMockValue)
            }
        },

        expectedUuidMockValue: expectedUuidMockValue,
        uuidMock: {

            default: {

                v4: vi.fn(() => expectedUuidMockValue)
            }
        }
    }

    mocks.expressMock.default.json = vi.fn(() => mocks.expectedJsonMockValue)
    mocks.expressMock.default.static = vi.fn(() => mocks.expectedStaticMockValue)

    return mocks
})

describe('homeController', () => {

    const applicationPort = 9999
    const baseUrl = `http://localhost:${applicationPort}`
    const secret = 'fake-secret'

    let response;
    
    afterEach(() => {

        // This module always starts the express router, so we need to cancel it after each test.

        shutdown();
    });

    beforeAll(() =>{

        vi.mock('bcrypt', () => mocks.bcryptMock)
        vi.mock('express', () => mocks.expressMock)
        vi.mock('express-cache-ctrl', () => mocks.expressCacheCtrlMock)
        vi.mock('uuid', () => mocks.uuidMock)
    })

    it ('Creates the express application instance', async () => {

        homeController(applicationPort, baseUrl, secret)

        expect(mocks.expressMock.default).toBeCalled()
    })

    it('Configures EJS as the view engine', async () => {

        homeController(applicationPort, baseUrl, secret)

        expect(mocks.appMock.set).toHaveBeenCalledWith('view engine', 'ejs')
    })

    it('Configures the static source as \'./assets\'', async () => {

        homeController(applicationPort, baseUrl, secret)

        expect(mocks.expressMock.default.static).toHaveBeenCalledWith('./assets')
        expect(mocks.appMock.use).toHaveBeenCalledWith('/assets', mocks.expectedStaticMockValue)
    })

    it('Configures the JSON middleware', async () => {

        homeController(applicationPort, baseUrl, secret)

        expect(mocks.expressMock.default.json).toBeCalled()
        expect(mocks.appMock.use).toHaveBeenCalledWith(mocks.expectedJsonMockValue)
    })

    it('Configures a nocache, public path to favicon.ico', async () => {

        homeController(applicationPort, baseUrl, secret)
        
        expect(mocks.appMock.use).toHaveBeenCalledWith('/favicon.ico', mocks.expectedCacheDisableMockValue, expect.anything())
    })

    it('Listens on the application port', async () => {

        homeController(applicationPort, baseUrl, secret)

        expect(mocks.appMock.listen).toHaveBeenCalledWith(applicationPort)
    })

    it('Configures a nocache, public path to landing: [ /, /index, /index.html ]', async () => {

        homeController(applicationPort, baseUrl, secret)

        expect(mocks.appMock.get).toHaveBeenCalledWith([ '/', '/index', '/index.html' ],mocks.expectedCacheDisableMockValue, expect.anything())
    })

    it('Configures a nocache, public path to to DELETE a pyrate', async () => {

        homeController(applicationPort, baseUrl, secret)

        expect(mocks.appMock.delete).toHaveBeenCalledWith('/pyrates/:pyrate', mocks.expectedCacheDisableMockValue, expect.anything())
    })

    it('Configures a nocache, public path to to GET pyrates', async () => {

        homeController(applicationPort, baseUrl, secret)

        expect(mocks.appMock.get).toHaveBeenCalledWith('/pyrates', mocks.expectedCacheDisableMockValue, expect.anything())
    })

    it('Configures a nocache, public path to to GET a pyrate', async () => {

        homeController(applicationPort, baseUrl, secret)

        expect(mocks.appMock.get).toHaveBeenCalledWith('/pyrates/:pyrate', mocks.expectedCacheDisableMockValue, expect.anything())
    })

    it('Configures a nocache, public path to to POST a pyrate', async () => {

        homeController(applicationPort, baseUrl, secret)

        expect(mocks.appMock.post).toHaveBeenCalledWith('/pyrates', mocks.expectedCacheDisableMockValue, expect.anything())
    })

    it('Configures a nocache, public path to to PUT a pyrate', async () => {

        homeController(applicationPort, baseUrl, secret)

        expect(mocks.appMock.put).toHaveBeenCalledWith('/pyrates/:pyrate', mocks.expectedCacheDisableMockValue, expect.anything())
    })
})

export default {}