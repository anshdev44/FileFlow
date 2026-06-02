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


const ALLOWED_FILE_EXTENSIONS = [

    '.mp4', '.mkv', '.mov', '.mp3', '.wav', '.png', '.jpeg', '.jpg', '.gif', '.webp',

    '.pdf', '.docx', '.xlsx', '.pptx', '.txt', '.csv',

    '.zip', '.rar', '.7z', '.tar', '.gz', '.tar.gz'
];

const BLOCKED_FILE_EXTENSIONS = ['.exe', '.dmg', '.pkg', '.bat', '.sh'];

const getFileExtension = (filename) => {
    if (filename.endsWith('.tar.gz')) return '.tar.gz';
    const parts = filename.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
};

const isFileAllowed = (filename) => {
    const extension = getFileExtension(filename);


    if (BLOCKED_FILE_EXTENSIONS.includes(extension)) {
        return { allowed: false, reason: 'Executable files are not allowed' };
    }

    if (ALLOWED_FILE_EXTENSIONS.includes(extension)) {
        return { allowed: true };
    }

    return { allowed: false, reason: 'File type not supported' };
};



const initializeSocket = (io) => {
    const handleRoomCleanup = (socket, RoomName) => {
        if (!RoomName) return;

        const roomnameparts = RoomName.split('-');
        if (roomnameparts.length < 2) return;

        const otherUserSocketId = roomnameparts[0] === socket.id ? roomnameparts[1] : roomnameparts[0];
        io.to(otherUserSocketId).emit("Room-Closed-Req");

        io.in(RoomName).socketsLeave(RoomName);
    };
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

            // console.log(` ${deviceName} registered successfully in  pool [${networkPrefix}]`);
            console.log("new active devices list are", activeDevices)
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
            socket.emit("NETWORK_DEVICES_UPDATED", devices);
        });

        socket.on("Connection", (payload) => {
            const HostsocketID = socket.id;
            const targetsocketID = payload.socketID;
            const senderName = payload.senderName;

            io.to(targetsocketID).emit("Connection-Request", {
                senderName: senderName,
                SenderSocketid: HostsocketID
            });
        });

        socket.on("Respond-Connection", (payload) => {
            const { accepted, senderSocketId, acceptorName } = payload;
            const targetSocketId = socket.id;

            if (!accepted) {
                io.to(senderSocketId).emit("Connection-Declined");
            }
            else if (accepted) {
                let transactionRoomId = `${senderSocketId}-${targetSocketId}`;
                console.log("room Requested accepted", targetSocketId, senderSocketId)
                socket.join(transactionRoomId);
                const senderSocket = io.sockets.sockets.get(senderSocketId);
                if (senderSocket) {
                    senderSocket.join(transactionRoomId);
                }
                io.to(senderSocketId).emit("Connection-Accepted", {
                    transactionRoomId: transactionRoomId,
                    acceptorName: acceptorName || "Device",
                    acceptorSocketId: targetSocketId
                });
            }
        });

        socket.on("Disconnect-room", (payload) => {
            handleRoomCleanup(socket, payload.RoomName);
        });

        socket.on("disconnecting", () => {
            const socketid = socket.id;
            const currentRooms = Array.from(socket.rooms);

            currentRooms.forEach(room => {
                if (room.startsWith("transfer-") || room.includes('-')) {
                    handleRoomCleanup(socket, room);
                }
            });
        });
        socket.on("Max-Allowed-File-Size", (payload, callback) => {
            const socketId = socket.id;
            const { targetSocketId, senderDeviceType, ipAddress } = payload;

            if (!ipAddress) {
                return callback({ allowedSize: 500 * 1024 * 1024 });
            }

            const ipParts = ipAddress.split('.');
            const networkPrefix = `${ipParts[0]}.${ipParts[1]}`;

            let targetDeviceType = "desktop";
            const networkGrid = activeDevices[networkPrefix] || [];

            for (const device of networkGrid) {
                if (device.socketId === targetSocketId) {
                    targetDeviceType = device.deviceType;
                    break;
                }
            }
            let maxAllowedSize = 2 * 1024 * 1024 * 1024;

            if (senderDeviceType === "mobile") {
                maxAllowedSize = 500 * 1024 * 1024;
            } else if (senderDeviceType === "desktop") {
                if (targetDeviceType === "mobile") {
                    maxAllowedSize = 500 * 1024 * 1024;
                } else {
                    maxAllowedSize = 2 * 1024 * 1024 * 1024;
                }
            }
            callback({ allowedSize: maxAllowedSize });
        });

        socket.on("Validate-File", (payload, callback) => {
            const { filename, fileSize, maxAllowedSize } = payload;

            // Validate file type
            const fileValidation = isFileAllowed(filename);
            if (!fileValidation.allowed) {
                return callback({
                    valid: false,
                    reason: fileValidation.reason
                });
            }

        
            if (fileSize > maxAllowedSize) {
                const formatFileSize = (bytes) => {
                    if (bytes === 0) return '0 B';
                    const k = 1024;
                    const sizes = ['B', 'KB', 'MB', 'GB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
                };

                return callback({
                    valid: false,
                    reason: `File size ${formatFileSize(fileSize)} exceeds maximum allowed size of ${formatFileSize(maxAllowedSize)}`
                });
            }

            callback({ valid: true });
        });

        socket.on("STREAM_FILE_CHUNK", (paylaod) => {
            const { room, chunkData, fileName, totalSize, isLastChunk } = paylaod;

            socket.to(room).emit("RECEIVE_FILE_CHUNK", {
                chunkData: chunkData,
                fileName: fileName,
                totalSize: totalSize,
                isLastChunk: isLastChunk
            });

            if (isLastChunk) {
                console.log(`Transfer of File is complete`);
            }

        })

        socket.on("disconnect", () => {
            //           const socketid = socket.id;
            // activeDevices[network] = activeDevices[network].filter((device) => { device.socketId !== socketid });
            const socketid = socket.id;
            for (const network in activeDevices) {
                activeDevices[network] = activeDevices[network].filter((device) => device.socketId !== socketid);
                io.to(network).emit("NETWORK_DEVICES_UPDATED", activeDevices[network]);
            }
            console.log("Device disconnected:", socketid, activeDevices);
        })
    })
}

module.exports = { initializeSocket };
