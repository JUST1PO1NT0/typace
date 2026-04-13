import type { Config } from 'jest'

const config: Config = {
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testEnvironment: "jsdom",
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    }
}

export default config;