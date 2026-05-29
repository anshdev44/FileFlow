const { APIResponse } = require("../utils/ApiResponse");

const healthCheck = (req, res) => {
  const response = new APIResponse(200, "Connected to File Flow Backend", "Success");
  return res.status(200).json(response);
};

module.exports = { healthCheck };