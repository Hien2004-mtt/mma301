# Firebase Notifications Setup

This project is now scaffolded to request notification permission, create the Android notification channel, read the native device token, and save that token to Firestore in the `pushTokens` collection.

## What you still need to provide

1. Fill the Firebase config in `src/services/firebase/config.js`.
2. Replace `YOUR_EXPO_PROJECT_ID` in `app.json` (`expo.extra.eas.projectId`) or `src/services/notifications/config.js`.
3. Put `google-services.json` in project root (`./google-services.json`).
4. If you also build iOS, put `GoogleService-Info.plist` in project root (`./GoogleService-Info.plist`).
5. Build a development client or release build. Native push tokens do not work reliably in Expo Go.

## How to get `google-services.json` (Android)

Before creating Android app in Firebase, make sure you have a fixed package name in `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.projectmma301"
    }
  }
}
```

1. Open Firebase Console -> choose your project.
2. Click **Project settings** (gear icon).
3. In **Your apps**, click **Add app** -> **Android**.
4. Enter Android package name (must match Expo app package used for build).
5. Register app and download `google-services.json`.
6. Copy file to project root as `./google-services.json`.

Important:

- If package name in Firebase and build package name do not match, FCM token will not work.
- After replacing `google-services.json`, rebuild the dev client/release build.

## Expo config already wired

`app.json` now includes:

- `expo.android.googleServicesFile = "./google-services.json"`
- `expo.ios.googleServicesFile = "./GoogleService-Info.plist"`

If either file is missing, native build will fail. Keep files out of git if needed and provide them in CI build secrets/artifacts.

## Firestore token shape

Each device token is stored in `pushTokens/{tokenDocId}` with:

- `userId`
- `platform`
- `nativeToken`
- `nativeType`
- `expoPushToken`
- `expoProjectId`
- `updatedAt`

## Suggested backend flow

Use your backend or Cloud Functions to:

1. Read the user device token from `pushTokens`.
2. Send an FCM HTTP v1 message using your Firebase service account.
3. Refresh or delete invalid tokens when FCM reports token expiration.

## Cloud Functions for comment/reply notifications

This repo now includes `functions/` with Firestore triggers:

- `onAnswerCreatedNotify`:
  - path: `questions/{questionId}/answers/{answerId}`
  - notifies question owner when another user posts an answer.
- `onCommentCreatedNotify`:
  - path: `questions/{questionId}/answers/{answerId}/comments/{commentId}`
  - notifies question owner and answer owner when another user comments.

### Install and deploy

Run from project root:

```bash
cd functions
npm install
npx firebase login
npx firebase use <your-firebase-project-id>
npx firebase deploy --only functions
```

### Payload sent to app

Each push includes:

- `type`: `answer_created` or `comment_created`
- `questionId`
- `answerId`
- `commentId` (for comment notifications)

## Quick test checklist

1. Log in on a physical Android device using a dev build (not Expo Go).
2. Accept notification permission.
3. Confirm a document appears in Firestore collection `pushTokens`.
4. Verify `nativeType` is `fcm` and `nativeToken` is not empty.
