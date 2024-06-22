// homeControllerTest.js
// Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.
//

import puppeteer from 'puppeteer'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { launch as appLaunch, shutdown as appShutdown } from '../../../src/identitydb-api/app'

describe('homeController', () => {

    let baseUrl
    let browser
    let page

    afterAll(() => {

        appShutdown()
    })

    beforeAll(async () => {

        process.chdir('./src/identitydb-api')                 // .env is in the identitydb-api folder; pool is set to 'forks' in vitest.config.js to allow this.
        delete(process.env.BASE_URL)                    // vitest sets BASE_URL (undocumented) so removing to the the .env setting is the easiest solution.

        // Launch the application (depend on it calling dotenv), pick up the new base url, and launch puppeteer.
    
        appLaunch()

        baseUrl = process.env.BASE_URL
        
        if (baseUrl.charAt(baseUrl.length - 1) === '/') {

            baseUrl = baseUrl.substring(0, baseUrl.length - 1)
        }

        browser = await puppeteer.launch()
    })

    beforeEach(async () => {

        page = await browser.newPage()
    })

    it('Retrieves the landing page', async () => {

        await page.goto(baseUrl)

        const banner = await page.$('th[class=title]')
        const title = await (await banner.getProperty('textContent')).jsonValue()

        expect(title).toEqual('Pyrate Identity')
    })

    it('Provides landing page navigation', async () => {
        
        await page.goto(baseUrl)

        const signOn = await page.$('a[href="/"]')

        expect(signOn).not.toBeNull()
    })
})

export default {}