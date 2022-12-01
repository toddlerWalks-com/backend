const router = require("express").Router();
const { verify } = require("../../../../verifyToken");
const {
  createWholesaler,
  fetchWholesaler,
} = require("../../../../private/services/Pharmacy/Wholesaler/wholesaler.service");

// Add customers to pharmacy
router.post("/add-new-wholesaler", async (req, res, next) => {
  try {
    return res.status(200).json(await createWholesaler({ req }));
  } catch (error) {
    next(error);
  }
});

// Fetch customer information
router.post("/fetch-wholesalers", async (req, res, next) => {
  const { facility_id } = req.body;
  try {
    return res.status(200).json(await fetchWholesaler({ facility_id }));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
