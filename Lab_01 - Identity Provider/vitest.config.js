// vitest.config.js
// Copyright © 2024 Joel A Mussman. All rights reserved.
//

import { defineConfig } from 'vitest/config';

const config = defineConfig({
    test: {
        coverage: {
            provider: 'v8'
        },
        pool: 'forks'
    }
})

export default config