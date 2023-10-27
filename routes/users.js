const router = require("express").Router();

const usersController = require("../controllers/users.js");
const authController = require("../controllers/auth");

// fetch user profile
router.get("/:id", authController.authenticate, usersController.getUser);

// add stock to an user's page
router.post("/:id/stocks", usersController.addStock);

// update the quantity of a stock (buying/selling)
router.put("/:id/stocks/:ticker", usersController.updateStock);

// remove a stock from a user's page
router.delete("/:id/stocks/:ticker", usersController.removeStock);

module.exports = router;
