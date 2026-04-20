module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@unimodules/.*|expo-modules-core|@tanstack/.*|@expo-google-fonts/.*)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^expo/src/winter$': '<rootDir>/src/__mocks__/expo-winter-stub.js',
    '^expo/src/winter/(.*)$': '<rootDir>/src/__mocks__/expo-winter-stub.js',
  },
};
