# Home Bills (React Native / Expo)

    npm install
    npx expo start      # scan the QR with Expo Go

- Icons: Iconify via `react-native-iconify` (needs internet on first load to fetch icons).
- Authentication uses Firebase Email/Password and bills are stored per user in Firestore. Enable Email/Password under Firebase Console → Authentication → Sign-in method, and deploy `firestore.rules` to the project.
- Deploy the rules with `npx --yes firebase-tools deploy --only firestore:rules --project homebills-d3980` after authenticating with `npx --yes firebase-tools login`.
- The app writes to a per-user local cache first, so it remains usable offline. Firestore listeners reconcile remote changes and upload newer local records when connectivity returns.
