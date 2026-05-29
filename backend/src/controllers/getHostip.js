const { networkInterfaces } = require('os');

// const { networkInterfaces } = require('os');
const { APIResponse } = require('../utils/ApiResponse');
const { APIError } = require('../utils/ApiError'); 



const checkip = (req, res, next) => {
    try {
        const nets = networkInterfaces();
        const results = {};

        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
                if (net.family === familyV4Value && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }

        if (Object.keys(results).length > 0) {
            return res.status(200).json(new APIResponse(200, results, "Got the Host IP"));
        }

        return res.status(404).json(new APIError(404, "No external IPv4 addresses found"));
    } catch (err) {
        next(new APIError(500, "Something went wrong while checking for networks", err.message));
    }
};

module.exports = { checkip }