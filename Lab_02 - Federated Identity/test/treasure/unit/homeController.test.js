// homeController.test.js
// Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.
//

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import homeController, { shutdown } from '../../../src/treasure/homeController'

// Hoist the common definitions for mocking (this must be outside of any function).

const mocks = vi.hoisted(() => {

    const expectedStaticMockValue = 1234
    const expectedCacheDisableMockValue = 4567
    const expectedAuthMockValue = 8901
    const expectedRequiresAuthMockValue = 2345

    const appMock = {

        listen: vi.fn(),
        get: vi.fn(),
        set: vi.fn(),
        use: vi.fn()
    }

    const mocks = {

        appMock: appMock,
 
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

        expectedAuthMockValue: expectedAuthMockValue,
        expectedRequiresAuthMockValue: expectedRequiresAuthMockValue,
        expressOpenIdConnectMock: {

            default: {

                auth: vi.fn(() => expectedAuthMockValue),
                requiresAuth: vi.fn(() => expectedRequiresAuthMockValue)
            }
        }
    }

    mocks.expressMock.default.static = vi.fn(() => mocks.expectedStaticMockValue)

    return mocks
})


describe('homeController', () => {

    const applicationPort = 9999
    const issuerBaseUrl = 'https://wonderfulwidgets.us.auth0.com'
    const baseUrl = `http://localhost:${applicationPort}`
    const clientId = 'fake-client-id'
    const clientSecret = 'fake-client-secret'
    const secret = 'fake-secret'
    const pyratesUrl = `http://localhost:${applicationPort - 1}`

    let response;
    
    afterEach(() => {

        // This module always starts the express router, so we need to cancel it after each test.

        shutdown();
    });

    beforeAll(() =>{

        vi.mock('express', () => mocks.expressMock)
        vi.mock('express-cache-ctrl', () => mocks.expressCacheCtrlMock)
        vi.mock('express-openid-connect', () => mocks.expressOpenIdConnectMock)
    })

    it ('Creates the express application instance', async () => {

        homeController(issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, pyratesUrl)

        expect(mocks.expressMock.default).toBeCalled()
    })

    it('Configures EJS as the view engine', async () => {

        homeController(issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, pyratesUrl)

        expect(mocks.appMock.set).toHaveBeenCalledWith('view engine', 'ejs')
    })

    it('Added the express-openid-connect OIDC middleware', async () => {

        homeController(issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, pyratesUrl)

        expect(mocks.appMock.use).toHaveBeenCalledWith(mocks.expectedAuthMockValue)
    })

    it('Uses the injected values for the auth configuration', async () => {

        homeController(issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, pyratesUrl)

        expect.objectContaining({
            baseURL: baseUrl,
            clientID: clientId,
            clientSecret: clientSecret,
            issuerBaseURL: issuerBaseUrl,
            secret: secret
        })
    })

    it('Does not require authentication for all paths in the auth configuration', async () => {

        homeController(issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, pyratesUrl)

        expect.objectContaining({
            idpLogout: true
        })
    })

    it('Requests authorization-code flow and all possible user data in the auth configuration', async () => {

        homeController(issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, pyratesUrl)

        expect.objectContaining({
            authorizationParams: {
                response_type: 'code',
                scope: 'openid profile email'
            }
        })
    })

    it('Allows IdP logout in the auth configuration', async () => {

        homeController(issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, pyratesUrl)

        expect.objectContaining({
            authRequired: false
        })
    })

    it('Configures the static source as \'./assets\'', async () => {

        homeController(issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, pyratesUrl)

        expect(mocks.expressMock.default.static).toHaveBeenCalledWith('./assets')
        expect(mocks.appMock.use).toHaveBeenCalledWith('/assets', mocks.expectedStaticMockValue)
    })

    it('Configures a nocache, public path to favicon.ico', async () => {

        homeController(issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, pyratesUrl)
        
        expect(mocks.appMock.use).toHaveBeenCalledWith('/favicon.ico', mocks.expectedCacheDisableMockValue, expect.anything())
    })

    it('Listens on the application port', async () => {

        homeController(issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, pyratesUrl)

        expect(mocks.appMock.listen).toHaveBeenCalledWith(applicationPort)
    })

    it('Configures a nocache, public path to landing: [ /, /index, /index.html ]', async () => {

        homeController(issuerBaseUrl, clientId, clientSecret, secret, applicationPort, baseUrl, pyratesUrl)

        expect(mocks.appMock.get).toHaveBeenCalledWith([ '/', '/index', '/index.html' ], mocks.expectedRequiresAuthMockValue, mocks.expectedCacheDisableMockValue, expect.anything())
    })

    // /logout is registered and handled by express-openid-connect so there is nothing to test.
})

export default {}