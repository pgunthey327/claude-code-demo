function policyDetailsValidator(amount, constraints) {
  const errors = [];

  if (constraints.required && (amount === null || amount === undefined || amount === "")) {
    errors.push("amount is required");
  }

  if (typeof amount === "boolean") {
    errors.push("amount must be a valid number");
    return { valid: false, amount, constraints, errors };
  }

  if (typeof amount === "string" && amount.trim() === "") {
    errors.push("amount must be a valid number");
    return { valid: false, amount, constraints, errors };
  }

  if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) {
    errors.push("amount must be a valid number");
    return { valid: false, amount, constraints, errors };
  }

  const parsed = Number(amount);

  if (constraints.min !== undefined && parsed < constraints.min) {
    errors.push(`amount must be >= ${constraints.min}`);
  }

  if (constraints.max !== undefined && parsed > constraints.max) {
    errors.push(`amount must be <= ${constraints.max}`);
  }

  return { valid: errors.length === 0, amount: parsed, constraints, errors };
}

module.exports = policyDetailsValidator;
module.exports.policyDetailsValidator = policyDetailsValidator;
