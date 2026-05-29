const wifi = require('node-wifi');
const { APIError } = require('../utils/ApiError'); 
const { APIResponse } = require('../utils/ApiResponse');

wifi.init({ iface: null });

const checkconnection = async (req, res, next) => {
    try {
        const connections = await wifi.getCurrentConnections();

        if (connections && connections.length > 0) {
            return res.status(200).json(
                new APIResponse(200, { connections }, "Connected to Wi-Fi successfully")
            );
        }

        return res.status(400).json(
            new APIError(400, "Not connected to Wi-Fi or using an Ethernet cable")
        );

    } catch (err) {
        next(new APIError(500, "Something went wrong while checking for networks", err.message));
    }
};

module.exports = { checkconnection };