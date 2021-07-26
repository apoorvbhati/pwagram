var deferredPrompt;
var enableNoticationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {
    var options = {
      body: 'You successfully subcribed to our notification service',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: 'src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US',
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png'},
        { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png'}
      ]
    };

    navigator.serviceWorker.ready
      .then(function(swreg) {
        swreg.showNotification('Successfully subscribed!', options);
        console.log('The SW notification ran');
      })
  }
}

function configurePushSub() {
  if(!('serviceWorker' in navigator)) {
    return;
  }

  var reg;
  navigator.serviceWorker.ready
  .then(function(swreg) {
    reg = swreg;
    return swreg.pushManager.getSubscription();
  })
  .then(function(sub) {
    if(sub === null) {
      // var vapidPublicKey = 'BKcu2LpeftH6gM5NnfGUgY9lEf6RZNoScilfepcTElDQ0nJLTFhMWBi_4pv4kauuVilIL0NP6UEv_kO4Hr-pQEo';
      var vapidPublicKey = 'BOUSJRw2jC_e6rDZmDxlx6r7mIaVUWT4-Hq0bJgF_AGkZd_Ky70D78MKzyOoZEVygiMY5DbBG0jluY6oSQfd8f0';
      var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidPublicKey
      })
    } else {
      // We have a sibscription
    }
  })
  .then(function(newSub) {
    return fetch('https://pwagram-15443-default-rtdb.firebaseio.com/subscriptions.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(newSub)
    })
  })
  .then(function(res) {
    if (res.ok) {
      displayConfirmNotification();
    }
  })
  .catch(function(err) {
    console.log(err);
  });
}

function askForNotificationPermission() {
  Notification.requestPermission(function(result) {
    console.log('User Choice', result);
    if (result !== 'granted') {
      console.log('No notifications permission granted!');
    } else {
      // configurePushSub();
      displayConfirmNotification();
    }
  })
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  for (var i=0; i<enableNoticationsButtons.length; i++) {
    enableNoticationsButtons[i].style.display = 'inline-block';
    enableNoticationsButtons[i].addEventListener('click', askForNotificationPermission)
  }
}


// Public Key:
// BOUSJRw2jC_e6rDZmDxlx6r7mIaVUWT4-Hq0bJgF_AGkZd_Ky70D78MKzyOoZEVygiMY5DbBG0jluY6oSQfd8f0

// Private Key:
// EmIQgG0WkhnLvG9oEmpbFTRHsHrN8TJ1QuILYyx57W8