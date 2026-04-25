const express = require("express");
const policyDetailsValidator = require("./validator");

const app = express();

app.use(express.json());

app.post("/api/validate", (req, res, next) => {
  const { amount, constraints } = req.body;

  if (amount == null || constraints == null || typeof constraints !== 'object' || Array.isArray(constraints)) {
    return res.status(400).json({ success: false, error: "Missing required fields: amount and constraints" });
  }

  let result;
  try {
    result = policyDetailsValidator(amount, constraints);
  } catch (err) {
    return next(err);
  }
  res.status(200).json({ success: true, data: result });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, error: "Internal server error" });
});

module.exports = app;
