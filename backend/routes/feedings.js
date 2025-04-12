const express = require("express");
const router = express.Router();
const {
  getFeedings,
  addFeeding,
  deleteFeeding,
  updateFeeding
} = require("../controllers/feedingsController");

router.get("/", getFeedings);
router.post("/", addFeeding);
router.delete("/:id", deleteFeeding);
router.put("/:id", updateFeeding);

module.exports = router;
