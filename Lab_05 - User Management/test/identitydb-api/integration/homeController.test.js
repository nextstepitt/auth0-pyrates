// homeController.test.js
// Copyright © 2024 Joel A Mussman and NextStep IT Training powered by Smallrock. All rights reserved.
//

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { launch as appLaunch, shutdown as appShutdown } from '../../../src/identitydb-api/app'

// Hoist the common definitions for mocking (this must be outside of any function).

const mocks = vi.hoisted(() => {

    const expectedUuidMockValue = '1234-'
    const failNodeRsBcrypt = false

    return {

        dotenvMock: {

            config: vi.fn(() => {

                process.env.APPLICATION_PORT = '9999'
                process.env.BASE_URL = 'http://localhost:9999/'
                process.env.SECRET = 'fake-secret'
            })
        },

        failNodeRsBcrypt: failNodeRsBcrypt,

        expectedUuidMockValue: expectedUuidMockValue,
        uuidMock: {

            v4: vi.fn(() => expectedUuidMockValue)
        }
    }
})

describe('homeController', () => {
    
    process.chdir('./src/identitydb-api')     // EJS page rendering needs to start here.

    let applicationPort
    let baseUrl
    let credentials
    const anneBonnyEmail = 'anne.bonny@potc.live'
    const anneBonnyFirstName = 'Anne'
    const anneBonnyLastName = 'Bonny'
    const anneBonnyShipName = 'William'
    const henryMorganId = '35059dc7-5d89-44b5-b191-6e31820ac6e3'
    const henryMorganEmail = 'henry.morgan@potc.live'
    const henryMorganFirstName = 'Henry'
    const henryMorganLastName = 'Morgan'
    const henryMorganShipName = 'Satisfaction'
    const password = 'P!rates17'
    const williamKiddId = 'acdcd7f6-10f1-4030-a5f8-73da8000bceb'
    const unknownPyrateId = '1234'
    const unknownPyrateEmail = 'unknown.pyrate@potc.live'
    const unknownPyrateFirstName = 'Unknown'
    const unknownPyrateLastName = 'Pyrate'
    const unknownPyrateShipName = 'Queen Anne\'s Revenge'
    const unknownPyratePassword = 'P!rates18'
 
    afterAll(() => {

        appShutdown()
    })

    beforeAll(async () => {

        vi.mock('dotenv', () => mocks.dotenvMock)
        vi.mock('uuid', () => mocks.uuidMock)

        // Launch the application.
    
        appLaunch()
    
        applicationPort = process.env.APPLICATION_PORT
        credentials = Buffer.from(`:${process.env.SECRET}`).toString('base64')
        baseUrl = process.env.BASE_URL

        if (baseUrl.charAt(baseUrl.length - 1) === '/') {

            baseUrl = baseUrl.substring(0, baseUrl.length - 1)
        }

        vi.mock('@node-rs/bcrypt', async (importOriginal) => {

            const module = await importOriginal()

            return {
                hash: async (password, round) => !mocks.failNodeRsBcrypt ? module.hash(password, round) : (function() { throw 'bcrypt error' }).call(),
                verify: async (password, hash) => !mocks.failNodeRsBcrypt ? module.verify(password, hash) : (function() { throw 'bcrypt error' }).call()
            }
        })
    })

    beforeEach(async () => {

        mocks.expectedBcryptErrorMockValue = false
        mocks.failNodeRsBcrypt = false

        // Reset Henry Morgan to original values.

        await fetch(`${baseUrl}/pyrates/${henryMorganId}`, {
            
            method: 'PUT',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({

                email: henryMorganEmail,
                firstName: henryMorganFirstName,
                lastName: henryMorganLastName,
                ship: henryMorganShipName,
                email_verified: false,
                password: password
            })
        })

        // Delete any Anne Bonny that was added.

        await fetch(`${baseUrl}/pyrates/${anneBonnyEmail}`, {
            
            method: 'DELETE',
            headers: { 'Authorization': `basic ${credentials}` }
        })
    })

    it('Retrieves the favicon.ico file, nocache', async () => {

        const response = await fetch(`${baseUrl}/favicon.ico`)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toEqual('image/x-icon')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Retrieves the landing page with no path', async () => {

        const response = await fetch(baseUrl)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toContain('text/html')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Retrieves the landing page at /', async () => {

        const response = await fetch(`${baseUrl}/`)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toContain('text/html')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Retrieves the landing page at /index', async () => {

        const response = await fetch(`${baseUrl}/index`)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toContain('text/html')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Retrieves the landing page at /index.html', async () => {

        const response = await fetch(`${baseUrl}/index.html`)

        expect(response.status).toEqual(200)
        expect(response.headers.get('content-type')).toContain('text/html')
        expect(response.headers.get('cache-control')).toContain('no-cache')
    })

    it('Rejects default.html as the landing page', async () => {

        const response = await fetch(`${baseUrl}/default.html`)

        expect(response.status).toEqual(404)
    })

    it('Deletes pyrate', async () => {

        await fetch(`${baseUrl}/pyrates/${williamKiddId}`, { method: 'DELETE', headers: { 'Authorization': `basic ${credentials}` }})

        const response = await fetch(`${baseUrl}/pyrates`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const pyrates = await response.json()
        const status = pyrates.findIndex(pyrate => pyrate._id === williamKiddId)

        expect(status).toEqual(-1)
    })

    it('Rejects delete pyrate by id not found', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${unknownPyrateId}`, { method: 'DELETE', headers: { 'Authorization': `basic ${credentials}` }})

        expect(response.status).toEqual(404)
    })

    it('Rejects delete pyrate by email not found', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${unknownPyrateEmail}`, { method: 'DELETE', headers: { 'Authorization': `basic ${credentials}` }})

        expect(response.status).toEqual(404)
    })

    it('Rejects delete pyrate by id without authorization', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${unknownPyrateId}`, { method: 'DELETE' })

        expect(response.status).toEqual(401)
    })

    it('Rejects delete pyrate by email without authorization', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${unknownPyrateEmail}`, { method: 'DELETE' })

        expect(response.status).toEqual(401)
    })

    it('Retrieves all pyrates', async () => {

        const response = await fetch(`${baseUrl}/pyrates`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const pyrates = await response.json()
    
        expect(response.status).toEqual(200)
        expect(Array.isArray(pyrates)).toBeTruthy()
    })

    it('Retrieves specific pyrate by id', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const pyrate = await response.json()
    
        expect(response.status).toEqual(200)
        expect(pyrate._id).toEqual(henryMorganId)
    })

    it('Retrieves specific pyrate by email', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganEmail}`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const pyrate = await response.json()
    
        expect(response.status).toEqual(200)
        expect(pyrate.email).toEqual(henryMorganEmail)
    })

    it('Rejects retrieve unknown pyrate by id', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${unknownPyrateId}`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
    
        expect(response.status).toEqual(404)
    })

    it('Rejects retrieve unknown pyrate by email', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${unknownPyrateEmail}`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
    
        expect(response.status).toEqual(404)
    })

    it('Rejects specific pyrate by id without authorization', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET' })
    
        expect(response.status).toEqual(401)
    })

    it('Rejects specific pyrate by id with incorrect authorization', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET', headers: { 'Authorization': '' } })
    
        expect(response.status).toEqual(401)
    })

    it('Rejects specific pyrate by email without authorization', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganEmail}`, { method: 'GET' })
    
        expect(response.status).toEqual(401)
    })

    it('Rejects specific pyrate by email with incorrect authorization', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET', headers: { 'Authorization': '' } })
    
        expect(response.status).toEqual(401)
    })

    it('Verifies correct password for pyrate by id', async () => {

        const credentials = Buffer.from(`${henryMorganEmail}:${password}`).toString('base64')

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})

        expect(response.status).toEqual(200)
    })

    it('Verifies correct password for pyrate by email', async () => {

        const credentials = Buffer.from(`${henryMorganEmail}:${password}`).toString('base64')

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganEmail}`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})

        expect(response.status).toEqual(200)
    })

    it('Rejects incorrect user password for pyrate by email', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET', headers: { 'Authorization': 'basic abc' }})

        expect(response.status).toEqual(401)
    })

    it('Rejects incorrect user password for pyrate by email', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganEmail}`, { method: 'GET', headers: { 'Authorization': 'basic abc' }})

        expect(response.status).toEqual(401)
    })

    it('Creates new pyrate and returns new _id', async () => {

        const response = await fetch(`${baseUrl}/pyrates`, {
            
            method: 'POST',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({

                email: anneBonnyEmail,
                firstName: anneBonnyFirstName,
                lastName: anneBonnyLastName,
                ship: anneBonnyShipName,
                email_verified: true,
                password: password
            })
        })

        const id = await response.json()
        expect(id._id).toBeTruthy()

        const userCredentials = Buffer.from(`${henryMorganEmail}:${password}`).toString('base64')
        const responseTwo = await fetch(`${baseUrl}/pyrates/${id._id}`, { method: 'GET', headers: { 'Authorization': `basic ${userCredentials}` }})
        const anneBonny = await responseTwo.json()

        expect(anneBonny.email).toEqual(anneBonnyEmail)
        expect(anneBonny.firstName).toEqual(anneBonnyFirstName)
        expect(anneBonny.lastName).toEqual(anneBonnyLastName)
        expect(anneBonny.ship).toEqual(anneBonnyShipName)
        expect(anneBonny.email_verified).toBeTruthy()
    })

    it('Rejects new pyrate without authentication', async () => {

        const response = await fetch(`${baseUrl}/pyrates`, {
            
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({

                email: anneBonnyEmail,
                firstName: anneBonnyFirstName,
                lastName: anneBonnyLastName,
                password: password
            })
        })

        expect(response.status).toEqual(401)
    })

    it('Rejects new pyrate with bad authentication', async () => {

        const response = await fetch(`${baseUrl}/pyrates`, {
            
            method: 'POST',
            headers: {'Authorization': 'basic abc', 'Content-Type': 'application/json' },
            body: JSON.stringify({

                email: anneBonnyEmail,
                firstName: anneBonnyFirstName,
                lastName: anneBonnyLastName,
                password: password
            })
        })

        expect(response.status).toEqual(401)
    })

    it('Rejects new pyrate without request body', async () => {

        const response = await fetch(`${baseUrl}/pyrates`, {
            
            method: 'POST',
            headers: {'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' }
        })

        expect(response.status).toEqual(400)
    })

    it('Rejects new pyrate without email address', async () => {

        const response = await fetch(`${baseUrl}/pyrates`, {
            
            method: 'POST',
            headers: {'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({

                firstName: anneBonnyFirstName,
                lastName: anneBonnyLastName,
                password: password
            })
        })

        expect(response.status).toEqual(400)
    })

    it('Rejects new pyrate with duplicate email address', async () => {

        const response = await fetch(`${baseUrl}/pyrates`, {
            
            method: 'POST',
            headers: {'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({

                email: henryMorganEmail,
                firstName: anneBonnyFirstName,
                lastName: anneBonnyLastName,
                password: password
            })
        })

        expect(response.status).toEqual(409)
    })

    it('Creates new pyrate with only email', async () => {

        await fetch(`${baseUrl}/pyrates`, {
            
            method: 'POST',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({

                email: anneBonnyEmail,
            })
        })

        const response = await fetch(`${baseUrl}/pyrates`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const pyrates = await response.json()
        const anneBonny = pyrates.find(pyrate => pyrate.email === anneBonnyEmail)

         expect(anneBonny.firstName).toBeFalsy()
         expect(anneBonny.lastName).toBeFalsy()
         expect(anneBonny.email_verified).toBeFalsy()
         expect(anneBonny.password).toBeFalsy()
    })

    it('Creates new pyrate with only firstName', async () => {

        await fetch(`${baseUrl}/pyrates`, {
            
            method: 'POST',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({

                email: anneBonnyEmail,
                firstName: anneBonnyFirstName
            })
        })

        const response = await fetch(`${baseUrl}/pyrates`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const pyrates = await response.json()
        const anneBonny = pyrates.find(pyrate => pyrate.email === anneBonnyEmail)

         expect(anneBonny.firstName).toEqual(anneBonnyFirstName)
         expect(anneBonny.lastName).toBeFalsy()
         expect(anneBonny.email_verified).toBeFalsy()
         expect(anneBonny.password).toBeFalsy()
    })

    it('Creates new pyrate with only lastName', async () => {

        await fetch(`${baseUrl}/pyrates`, {
            
            method: 'POST',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({

                email: anneBonnyEmail,
                lastName: anneBonnyLastName
            })
        })

        const response = await fetch(`${baseUrl}/pyrates`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const pyrates = await response.json()
        const anneBonny = pyrates.find(pyrate => pyrate.email === anneBonnyEmail)

         expect(anneBonny.firstName).toBeFalsy()
         expect(anneBonny.lastName).toEqual(anneBonnyLastName)
         expect(anneBonny.email_verified).toBeFalsy()
         expect(anneBonny.password).toBeFalsy()
    })

    it('Creates new pyrate with firstName, lastName, and password', async () => {

        await fetch(`${baseUrl}/pyrates`, {
            
            method: 'POST',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({

                email: anneBonnyEmail,
                lastName: anneBonnyLastName
            })
        })

        const response = await fetch(`${baseUrl}/pyrates`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const pyrates = await response.json()
        const anneBonny = pyrates.find(pyrate => pyrate.email === anneBonnyEmail)

         expect(anneBonny.firstName).toBeFalsy()
         expect(anneBonny.lastName).toEqual(anneBonnyLastName)
         expect(anneBonny.email_verified).toBeFalsy()
         expect(anneBonny.password).toBeFalsy()
    })

    it('Creates new pyrate with firstName, lastName, email_verified, and password', async () => {

        await fetch(`${baseUrl}/pyrates`, {
            
            method: 'POST',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({

                email: anneBonnyEmail,
                firstName: anneBonnyFirstName,
                lastName: anneBonnyLastName,
                email_verified: true,
                password: password
            })
        })

        const response = await fetch(`${baseUrl}/pyrates`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const pyrates = await response.json()
        const anneBonny = pyrates.find(pyrate => pyrate.email === anneBonnyEmail)

        expect(anneBonny.firstName).toEqual(anneBonnyFirstName)
        expect(anneBonny.lastName).toEqual(anneBonnyLastName)
        expect(anneBonny.email_verified).toBeTruthy()
        expect(anneBonny.password).not.toBeNull()
   })

   it('Rejects new pyrate with password and bcrypt fails', async () => {

        mocks.failNodeRsBcrypt = true

        const response = await fetch(`${baseUrl}/pyrates`, {
            
            method: 'POST',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                
                email: anneBonnyEmail,
                password: password
            })
        })

        expect(response.status).toEqual(500)
    })


   it('Updates pyrate', async () => {

        await fetch(`${baseUrl}/pyrates/${henryMorganEmail}`, {
            
            method: 'PUT',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({

                email: unknownPyrateEmail,
                firstName: unknownPyrateFirstName,
                lastName: unknownPyrateLastName,
                ship: unknownPyrateShipName,
                email_verified: true,
                password: unknownPyratePassword
            })
        })

        const userCredentials = Buffer.from(`${henryMorganEmail}:${unknownPyratePassword}`).toString('base64')
        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET', headers: { 'Authorization': `basic ${userCredentials}` }})
        const henryMorgan = await response.json()

        expect(henryMorgan.email).toEqual(unknownPyrateEmail)
        expect(henryMorgan.firstName).toEqual(unknownPyrateFirstName)
        expect(henryMorgan.lastName).toEqual(unknownPyrateLastName)
        expect(henryMorgan.ship).toEqual(unknownPyrateShipName)
        expect(henryMorgan.email_verified).toBeTruthy()
    })

    it('Rejects update pyrate with bad id', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${unknownPyrateId}`, {
            
            method: 'PUT',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' }
        })

        expect(response.status).toEqual(404)
    })

    it('Rejects update pyrate with bad email', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${unknownPyrateEmail}`, {
            
            method: 'PUT',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' }
        })

        expect(response.status).toEqual(404)
    })

    it('Rejects update pyrate without authorization', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, {
            
            method: 'PUT',
            headers: { 'Authorization': 'basic abc', 'Content-Type': 'application/json' }
        })

        expect(response.status).toEqual(401)
    })

    it('Rejects update pyrate without request body', async () => {

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, {
            
            method: 'PUT',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' }
        })

        expect(response.status).toEqual(400)
    })

    it('Updates pyrate with only email', async () => {

        await fetch(`${baseUrl}/pyrates/${henryMorganId}`, {
            
            method: 'PUT',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: unknownPyrateEmail })
        })

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const henryMorgan = await response.json()
  
        expect(henryMorgan.email).toEqual(unknownPyrateEmail)
    })

    it('Updates pyrate with only firstName', async () => {

        await fetch(`${baseUrl}/pyrates/${henryMorganId}`, {
            
            method: 'PUT',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName: unknownPyrateFirstName })
        })

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const henryMorgan = await response.json()
  
        expect(henryMorgan.firstName).toEqual(unknownPyrateFirstName)
    })

    it('Updates pyrate with only lastName', async () => {

        await fetch(`${baseUrl}/pyrates/${henryMorganId}`, {
            
            method: 'PUT',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ lastName: unknownPyrateLastName })
        })

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const henryMorgan = await response.json()
  
        expect(henryMorgan.lastName).toEqual(unknownPyrateLastName)
    })

    it('Updates pyrate with only email_verified', async () => {

        await fetch(`${baseUrl}/pyrates/${henryMorganId}`, {
            
            method: 'PUT',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email_verified: true })
        })

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET', headers: { 'Authorization': `basic ${credentials}` }})
        const henryMorgan = await response.json()
  
        expect(henryMorgan.email_verified).toBeTruthy()
    })

    it('Updates pyrate with only password', async () => {

        await fetch(`${baseUrl}/pyrates/${henryMorganId}`, {
            
            method: 'PUT',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: unknownPyratePassword })
        })

        const userCredentials = Buffer.from(`${henryMorganEmail}:${unknownPyratePassword}`).toString('base64')
        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET', headers: { 'Authorization': `basic ${userCredentials}` }})

        expect(response.status).toEqual(200)
    })

    it('Updates pyrate with only firstName and lastName', async () => {

        await fetch(`${baseUrl}/pyrates/${henryMorganId}`, {
            
            method: 'PUT',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName: unknownPyrateFirstName, lastName: unknownPyrateLastName })
        })

        const userCredentials = Buffer.from(`${henryMorganEmail}:${password}`).toString('base64')
        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, { method: 'GET', headers: { 'Authorization': `basic ${userCredentials}` }})
        const henryMorgan = await response.json()
  
        expect(henryMorgan.firstName).toEqual(unknownPyrateFirstName)
        expect(henryMorgan.lastName).toEqual(unknownPyrateLastName)
    })

    it('Rejects update pyrate with password and bcrypt fails', async () => {

        mocks.failNodeRsBcrypt = true

        const response = await fetch(`${baseUrl}/pyrates/${henryMorganId}`, {
            
            method: 'PUT',
            headers: { 'Authorization': `basic ${credentials}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: unknownPyratePassword })
        })

        expect(response.status).toEqual(500)
    })
})

export default {}