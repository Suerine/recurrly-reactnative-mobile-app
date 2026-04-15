// Dynamic Expo config — extends app.json with runtime environment variables.
// PostHog tokens are read at build time and exposed via expo-constants.
const { expo } = require('./app.json')

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...expo,
    extra: {
      ...expo.extra,
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
    },
  },
}
