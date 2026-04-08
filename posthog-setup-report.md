<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Recurrly — a React Native (Expo) subscription management app.

## What was set up

- **`posthog-react-native`** and **`react-native-svg`** installed as dependencies.
- **`app.config.js`** created to expose `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from `.env` via `expo-constants` at build time.
- **`src/config/posthog.ts`** — PostHog client singleton with batching, lifecycle events, and graceful disabled-state when token is missing.
- **`app/_layout.tsx`** — `PostHogProvider` wrapping the whole app, manual screen tracking for Expo Router, and a `UserIdentifier` component that calls `posthog.identify()` with the Clerk user ID (non-PII) on sign-in and `posthog.reset()` on sign-out.
- **Auth screens** — sign-in and sign-up events captured at each critical step; no PII is sent in any `posthog.capture()` call.
- **Home screen** — subscription card expansion tracked with name and category.
- **Settings** — sign-out event captured before Clerk session ends.
- **Subscription details** — page-view event captured on mount.

## Event tracking summary

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signs in (password or password+MFA) | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | Sign-in attempt fails | `app/(auth)/sign-in.tsx` |
| `user_mfa_started` | MFA step triggered after password entry | `app/(auth)/sign-in.tsx` |
| `user_mfa_completed` | MFA verification succeeds | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | New user completes verification and account is created | `app/(auth)/sign-up.tsx` |
| `user_sign_up_failed` | Sign-up fails at any step (create / password / verification) | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signs out from the settings screen | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User expands a subscription card on the home screen | `app/(tabs)/index.tsx` |
| `subscription_details_viewed` | User navigates to a subscription detail screen | `app/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/155620/dashboard/610335
- **Sign-up to Active User Funnel**: https://eu.posthog.com/project/155620/insights/VRLs4Vhc
- **Daily Sign-ins and Sign-ups**: https://eu.posthog.com/project/155620/insights/p8x08bld
- **Auth Failure Rate**: https://eu.posthog.com/project/155620/insights/wEsCpMUU
- **Subscription Engagement**: https://eu.posthog.com/project/155620/insights/keYzl1vC
- **MFA Adoption**: https://eu.posthog.com/project/155620/insights/AbJOzhP8

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
