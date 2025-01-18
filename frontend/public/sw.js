self.addEventListener('push', function(event) {
    try{
        if (
            typeof Notification === 'undefined' ||
            Notification.permission !== 'granted' ||
            !event.data
          ) {
            return;
          }
        const data = event.data?.json();
        const title = data.title;
        const options = {
            body: data.body,
            data: {
                url: data.url || '/'
            }
        };
    
        event.waitUntil(
            self.registration.showNotification(title, options)
        );
        console.log(data)
    } catch (err){
        console.error(err)
    }
});

self.addEventListener('notificationclick', function(event) {
    const notification = event.notification;
    const url = notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function(clientList) {
            const client = clientList.find(client => client.url === url);
            if (client) {
                client.focus();
            } else {
                clients.openWindow(url);
            }
            notification.close();
        })
    );
});
