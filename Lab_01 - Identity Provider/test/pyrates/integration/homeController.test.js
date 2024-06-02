// homeController.test.js
// Copyright © 2024 NextStep IT Training. All rights reserved.
//

import { config as dotenvConfig } from 'dotenv'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { launch as appLaunch, shutdown as appShutdown } from '../../../src/pyrates/app'

// Hoist the common definitions for mocking (this must be outside of any function).

const mocks = vi.hoisted(() => {

    const requestOidcUserMock = { value: false }
    const requiresAuthMockToggle = { value: false }  // true means respond with 400, false means mock user authenticated and call next().

    return {

        requestOidcUserMock: requestOidcUserMock,
        requiresAuthMockToggle: requiresAuthMockToggle,
        requiresAuthMock: vi.fn(() => (request, response, next) => {

            if (requestOidcUserMock.value) {

                // This is to cause the endpoint to think the user is authenticated, with a picture, to get complete test coverage. This
                // is the one place a questionable function call is inserted into the code, because requiresAuth(() => false) is placed
                // in the endpoint definition for the landing page. The function passed as the parameter returns false so that authentication
                // is not required for the landing page. The only reason for the call is to mock request.oidc for the test and get
                // complete coverage for the / and /profile page requests.

                request.oidc = { isAuthenticated: () => true, user: { picture: '/images/gravatar.jpg' }}
            }
            
            if (requiresAuthMockToggle.value) {
                
                response.status(400).json({ error: 'Not authenticated' })
            
            } else {

                next()
            }
        })
    }
})

describe('homeController', () => {

    let applicationPort
    let issuerBaseUrl
    let baseUrl
    let treasureUrl

    afterAll(() => {

        appShutdown()
    })

    beforeAll(async () => {

        process.chdir('./src/pyrates')                  // .env is in the pyrates folder; pool is set to 'forks' in vitest.config.js to allow this.
        delete(process.env.BASE_URL)                    // vitest sets BASE_URL (undocumented) so removing to the the .env setting is the easiest solution.
        dotenvConfig()
    
        applicationPort = process.env.APPLICATION_PORT
        issuerBaseUrl = process.env.ISSUER_BASE_URL     
        baseUrl = process.env.BASE_URL

        if (baseUrl.charAt(baseUrl.length - 1) === '/') {

            baseUrl = baseUrl.substring(0, baseUrl.length - 1)
        }

        const baseUrlEnd = baseUrl.lastIndexOf(':')
        treasureUrl = `${baseUrl.substring(0, baseUrlEnd)}:${parseInt(applicationPort) + 1}/`

        // Remove (mock away) express-openid-connect to test the endpoint responses.

        vi.mock('express-openid-connect', async (importOriginal) => {

            const module = await importOriginal()

            return {
                default: {
                    ...module.default,                      // This is important, because request.oidc is created by auth.
                    requiresAuth: mocks.requiresAuthMock
                }
            }
        })

        // Launch the application.
    
        appLaunch()
    })

    beforeEach(async () => {

        mocks.requestOidcUserMock.value = false
        mocks.requiresAuthMockToggle.value = false
    })

    it('Retrieves the favicon.ico file, nocache, without authentication', async () => {

        const response = await fetch(`${baseUrl}/favicon.ico`)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toEqual('image/x-icon')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Retrieves the landing page with no path, without authentication', async () => {

        const response = await fetch(baseUrl)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toContain('text/html')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Retrieves the landing page at / without authentication', async () => {

        const response = await fetch(`${baseUrl}/`)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toContain('text/html')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Retrieves the landing page at /index without authentication', async () => {

        const response = await fetch(`${baseUrl}/index`)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toContain('text/html')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Retrieves the landing page at /index.html without authentication', async () => {

        const response = await fetch(`${baseUrl}/index.html`)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toContain('text/html')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Retrieves the landing page and passes the user avatar picture', async () => {

        mocks.requestOidcUserMock.value = true

        const response = await fetch(baseUrl)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toContain('text/html')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Rejects default.html as the landing page', async () => {

        const response = await fetch(`${baseUrl}/default.html`)

        expect(response.status).toEqual(404)
    })

    it('Retrieves the profile page with no authentication fails', async () => {

        mocks.requiresAuthMockToggle.value = true

        const response = await fetch(`http://localhost:${applicationPort}/profile`, { redirect: 'manual' })

        expect(response.status).toEqual(400)
    })

    it('Retrieves the profile page (authentication disabled)', async () => {

        const response = await fetch(`http://localhost:${applicationPort}/profile`)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toContain('text/html')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Retrieves the profile page and passes the user avatar picture', async () => {

        mocks.requestOidcUserMock.value = true

        const response = await fetch(`${baseUrl}/profile`)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toContain('text/html')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Redirects to the treasure app with no authentication fails', async () => {

        mocks.requiresAuthMockToggle.value = true

        const response = await fetch(`http://localhost:${applicationPort}/treasure`, { redirect: 'manual' })

        expect(response.status).toEqual(400)
    })

    it('Redirects to the treasure app (authentication disabled)', async () => {

        const response = await fetch(`http://localhost:${applicationPort}/treasure`, { redirect: 'manual' })

        expect(response.status).toEqual(302)
        expect(response.headers.get('location')).toEqual(treasureUrl)
    })

    // /logout is registered and handled by the express-openid-connect middleware so there is nothing to test.
})

export default {}