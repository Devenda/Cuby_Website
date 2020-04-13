// Setup joystick
var nipple = require('nipplejs').create({
    zone: document.getElementById('control'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'red'
});

// Setup WebSocket
var ws;
function connect() {
    console.log('(re)connecting Socket!');

    ws = new WebSocket('ws://cuby');

    ws.onopen = function (e) {
        console.log('Socket is (re)connected!');
    };

    ws.onclose = function (e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        ws = null;
        setTimeout(function () {
            connect();
        }, 1000);
    };

    ws.onerror = function (err) {
        // @ts-ignore
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        ws = null;
        setTimeout(function () {
            connect();
        }, 1000);
    };
}

connect();

// Subscribe to nipple vents
nipple.on('move', (evt, data) => {
    // @ts-ignore
    var degrees = Math.round(data.angle.degree).toString().padStart(3, '0');
    // @ts-ignore
    var distance = Math.round(data.distance).toString().padStart(3, '0');

    const buffer = new ArrayBuffer(8);
    const view = new Uint32Array(buffer);

    view[0] = degrees;
    view[1] = distance;

    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log(`degree: ${degrees}, distance: ${distance}`);
        // ws.send(`${degrees}${distance}`);
        ws.send(buffer);
    } 
})