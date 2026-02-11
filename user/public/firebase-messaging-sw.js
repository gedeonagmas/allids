// Scripts for firebase and firebase-messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyD0lvkJpjJ3DuVHtYS4Z1Hpfb7OkG-V5Ek",
    authDomain: "allids-2179d.firebaseapp.com",
    projectId: "allids-2179d",
    storageBucket: "allids-2179d.firebasestorage.app",
    messagingSenderId: "23132739875",
    appId: "1:23132739875:web:facfb1aa8c0fd942b85496"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/file.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
