// homeControllerTest.js
// Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.
//

import puppeteer from 'puppeteer'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { launch as appLaunch, shutdown as appShutdown } from '../../../src/pyrates/app'

// Hoist the common definitions for mocking (this must be outside of any function).

const mocks = vi.hoisted(() => {

    const isAuthenticatedMockToggle = { value: false }  // true changes request.oidc.isAuthorized to always return true.

    return {

        isAuthorizedMockToggle: isAuthenticatedMockToggle,
        requiresAuthMock: vi.fn(() => (request, response, next) => { isAuthenticatedMockToggle.value ? request.oidc.isAuthenticated = () => true : null; next() })
    }
})

describe('homeController', () => {

    let baseUrl
    let browser
    let page

    afterAll(() => {

        appShutdown()
    })

    beforeAll(async () => {

        process.chdir('./src/pyrates')                  // .env is in the pyrates folder; pool is set to 'forks' in vitest.config.js to allow this.
        delete(process.env.BASE_URL)                    // vitest sets BASE_URL (undocumented) so removing to the the .env setting is the easiest solution.

        // Remove (mock away) express-openid-connect to test the endpoint responses.

        vi.mock('express-openid-connect', async (importOriginal) => {

            const module = await importOriginal()

            return {
                default: {
                    ...module.default,
                    requiresAuth: mocks.requiresAuthMock
                }
            }
        })

        // Launch the application, pick up the new base url, and launch puppeteer.
    
        appLaunch()

        baseUrl = process.env.BASE_URL
        
        if (baseUrl.charAt(baseUrl.length - 1) === '/') {

            baseUrl = baseUrl.substring(0, baseUrl.length - 1)
        }

        browser = await puppeteer.launch()
    })

    beforeEach(async () => {

        mocks.isAuthorizedMockToggle.value = false
        page = await browser.newPage()
    })

    it('Retrieves the landing page (authentication disabled)', async () => {

        await page.goto(baseUrl)

        const banner = await page.$('h1')
        const title = await (await banner.getProperty('textContent')).jsonValue()

        expect(title).toEqual('Welcome to the Pyrates of the Caribbean!')
    })

    it('Provides landing page navigation, unauthenticated, shows the Sign Up link', async () => {

        await page.goto(baseUrl)

        const signOn = await page.$('a[href="/signon"]')

        expect(signOn).not.toBeNull()
    })

    it('Provides landing page navigation, unauthenticated, does not show the Logout link', async () => {

        await page.goto(baseUrl)

        const signOn = await page.$('a[href="/logout"]')

        expect(signOn).toBeNull()
    })

    it('Provides landing page navigation, unauthenticated, does not show the user avatar', async () => {

        await page.goto(baseUrl)

        const signOn = await page.$('img[class=avatar]')

        expect(signOn).toBeNull()
    })

    it('Provides landing page navigation, authenticated, does not show the Sign Up link', async () => {

        mocks.isAuthorizedMockToggle.value = true

        await page.goto(baseUrl)

        const signOn = await page.$('a[href="/signon"]')

        expect(signOn).toBeNull()
    })

    it('Provides landing page navigation, authenticated, shows the Logout link', async () => {

        mocks.isAuthorizedMockToggle.value = true

        await page.goto(baseUrl)

        const signOn = await page.$('a[href="/logout"]')

        expect(signOn).not.toBeNull()
    })

    it('Provides landing page navigation, authenticated, shows the user avatar', async () => {

        mocks.isAuthorizedMockToggle.value = true

        await page.goto(baseUrl)

        const signOn = await page.$('img[class=avatar]')

        expect(signOn).not.toBeNull()
    })

    it('Retrieves the profile page, authenticated', async () => {

        await page.goto(`${baseUrl}/profile`)

        const banner = await page.$('h1')
        const title = await (await banner.getProperty('textContent')).jsonValue()

        expect(title).toEqual('Your Profile')
    })

    it('Provides profile page navigation, unauthenticated, shows the Sign Up link', async () => {

        await page.goto(`${baseUrl}/profile`)

        const signOn = await page.$('a[href="/signon"]')

        expect(signOn).not.toBeNull()
    })

    it('Provides profile page navigation, unauthenticated, does not show the Logout link', async () => {

        await page.goto(`${baseUrl}/profile`)

        const signOn = await page.$('a[href="/logout"]')

        expect(signOn).toBeNull()
    })

    it('Provides profile page navigation, unauthenticated, does not show the user avatar', async () => {

        await page.goto(`${baseUrl}/profile`)

        const signOn = await page.$('img[class=avatar]')

        expect(signOn).toBeNull()
    })

    it('Provides profile page navigation, authenticated, does not show the Sign Up link', async () => {

        mocks.isAuthorizedMockToggle.value = true

        await page.goto(`${baseUrl}/profile`)

        const signOn = await page.$('a[href="/signon"]')

        expect(signOn).toBeNull()
    })

    it('Provides profile page navigation, authenticated, shows the Logout link', async () => {

        mocks.isAuthorizedMockToggle.value = true

        await page.goto(`${baseUrl}/profile`)

        const signOn = await page.$('a[href="/logout"]')

        expect(signOn).not.toBeNull()
    })

    it('Provides profile page navigation, authenticated, shows the user avatar', async () => {

        mocks.isAuthorizedMockToggle.value = true

        await page.goto(`${baseUrl}/profile`)

        const signOn = await page.$('img[class=avatar]')

        expect(signOn).not.toBeNull()
    })
})

export default {}