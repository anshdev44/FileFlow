class APIResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400; // any code below 400 is success
    }
}

module.exports = { APIResponse };