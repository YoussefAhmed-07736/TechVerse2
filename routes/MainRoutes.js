const express = require("express");
const router = express.Router();
const HomePageController = require("../controllers/HomePageController");
const ProductController = require("../controllers/ProductController");
const UsersController = require("../controllers/UsersControllers");

router.get("/", HomePageController.getHomePage);
router.get("/shop", HomePageController.getShopPage);
router.get("/about", HomePageController.getAboutPage);
router.get("/contact", HomePageController.getContactPage);
router.get("/login", HomePageController.getLoginPage);
router.get("/cart", HomePageController.getCartPage);
router.get("/terms", HomePageController.getTermsPage);
router.get("/product/:id", ProductController.getProductById);
router.get("/shop/products", ProductController.getAllProducts);
router.get("/logout", UsersController.logout);

module.exports = router;