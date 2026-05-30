let activeDvices = {}


// let activeDevices = {
//     "10.35": [
//         {
//             socketId: "Ka89XzLqP12",
//             deviceName: "Alex's MacBook Pro",
//             ipAddress: "10.35.4.12",
//             deviceType: "desktop"
//         }
//         {
//             socketId: "Ka89XzLqP13",
//             deviceName: "Alex's MacBook ",
//             ipAddress: "10.35.4.11",
//             deviceType: "mobile"

//         }

//     ]
// };

//  Stored in your server's RAM at the top of the file
let activeDevices = {};

const initializeSocket = (io) => {
    io.on("connection", (socket) => {
        // let clientIp = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress;
        // if (clientIp.includes('::ffff:')) {
        //     clientIp = clientIp.split('::ffff:')[1]; 
        // }
        // // Calculate the network prefix (e.g., "10.35")
        // console.log("cleint ip", clientIp);
        // const ipParts = clientIp.split('.');
        // console.log("ip parts are", ipParts)
        // const networkPrefix = `${ipParts[0]}.${ipParts[1]}`;
        // console.log("ntwrok prefixes", networkPrefix);
        socket.on("Register-device", (payload) => {
            const { deviceName, deviceType, clientIp } = payload;

            const safeIp = clientIp;
            console.log("✅", safeIp);
            if (!clientIp) {
                socket.emit("no-client-ip");
            }
            const ipParts = safeIp.split('.');
            const networkPrefix = `${ipParts[0]}.${ipParts[1]}`;

            if (!activeDevices[networkPrefix]) {
                activeDevices[networkPrefix] = [];
            }
            const newDevice = {
                socketId: socket.id,
                deviceName: deviceName || "Anonymous Device",
                deviceType: deviceType || "desktop",
                ipAddress: clientIp
            };
            const existingIndex = activeDevices[networkPrefix].findIndex(d => d.socketId === socket.id);
            if (existingIndex !== -1) {
                activeDevices[networkPrefix][existingIndex] = newDevice;
            } else {
                activeDevices[networkPrefix].push(newDevice);
            }


            socket.join(networkPrefix);

            //emitting event to notify everyone in the room that a person has joined;
            io.to(networkPrefix).emit("NETWORK_DEVICES_UPDATED", activeDevices[networkPrefix]);

            console.log(`📱 ${deviceName} registered successfully in subnet pool [${networkPrefix}]`);
            console.log("✅", activeDevices)
        })

        socket.on("Get-Nearby-Devices", (payload) => {

            const socketid = socket.id;
            const { clientip } = payload;
            const ipParts = clientip.split('.');
            const networkPrefix = `${ipParts[0]}.${ipParts[1]}`;
            const devices = [];
            for (let device of activeDevices[networkPrefix] || []) {
                if (device.socketId !== socketid) {
                    devices.push(device);
                }
            }
            console.log(devices);

        });

        socket.on("disconnect", (socket) => {
            const socketid = socket.id;
            for (const network in activeDevices) {
                console.log(network);
                activeDevices[network] = activeDevices[network].filter((device) => { device.socketId !== socketid });
            }
            // io.to(networkPrefix).emit("NETWORK_DEVICES_UPDATED", activeDevices[networkPrefix]);
        })
    })
}

module.exports = { initializeSocket };
