import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  // The test file you have is in a __tests__ directory
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  moduleNameMapper: {
    // Force @bitcoinerlab/secp256k1 to resolve to its CJS file
    "^@bitcoinerlab/secp256k1$":
      "<rootDir>/node_modules/@bitcoinerlab/secp256k1/dist/index.js",
    // Handle module aliases
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/app/(.*)$": "<rootDir>/src/app/$1",
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
  },
  // Add this to handle the __mocks__ directory from your testing strategy
  modulePathIgnorePatterns: ["<rootDir>/src/__mocks__"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
