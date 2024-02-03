importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js');

firebase.initializeApp({
  messagingSenderId: "798034219930",
});

const messaging = firebase.messaging();

try {

    messaging.setBackgroundMessageHandler(function (payload) {
        let data = JSON.parse(payload.data.data);
        const notificationTitle = data.title;
        const notificationOptions = {
            body: data.body,
            icon: './logo.png',
            image: data.image
        };

        return self.registration.showNotification(notificationTitle,
            notificationOptions);
    });

} catch (error) {
    console.log(error);
}