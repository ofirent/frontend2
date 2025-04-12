const pool = require("../db");

// Get current budget
const getBudget = async (req, res) => {
  const result = await pool.query("SELECT * FROM budget LIMIT 1");
  res.json(result.rows[0]);
};

// Update or create budget
const setBudget = async (req, res) => {
  const { value } = req.body;

  const existing = await pool.query("SELECT * FROM budget LIMIT 1");

  if (existing.rows.length > 0) {
    await pool.query("UPDATE budget SET value = $1 WHERE id = $2", [value, existing.rows[0].id]);
  } else {
    await pool.query("INSERT INTO budget (value) VALUES ($1)", [value]);
  }

  res.sendStatus(200);
};

module.exports = {
  getBudget,
  setBudget,
};
