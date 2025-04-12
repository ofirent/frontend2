const pool = require("../db");

const getFeedings = async (req, res) => {
  const result = await pool.query("SELECT * FROM feedings ORDER BY date, time");
  res.json(result.rows);
};

const addFeeding = async (req, res) => {
  const { date, time, foodType, amount } = req.body;
  await pool.query(
    "INSERT INTO feedings (date, time, food_type, amount) VALUES ($1, $2, $3, $4)",
    [date, time, foodType, amount]
  );
  res.sendStatus(201);
};

const deleteFeeding = async (req, res) => {
  const id = req.params.id;
  await pool.query("DELETE FROM feedings WHERE id = $1", [id]);
  res.sendStatus(204);
};

const updateFeeding = async (req, res) => {
  const id = req.params.id;
  const { date, time, foodType, amount } = req.body;
  await pool.query(
    "UPDATE feedings SET date = $1, time = $2, food_type = $3, amount = $4 WHERE id = $5",
    [date, time, foodType, amount, id]
  );
  res.sendStatus(200);
};

module.exports = {
  getFeedings,
  addFeeding,
  deleteFeeding,
  updateFeeding,
};
