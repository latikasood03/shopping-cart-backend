const express = require('express');
const { body } = require('express-validator');

const productController = require('../controllers/product');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.post("/add-product", productController.addProduct);

router.get("/products", productController.getProducts);

router.delete("/delete-product/:prodId", productController.deleteProduct);

router.get("/cart", isAuth, productController.getCart);

router.post("/cart", isAuth, productController.postCart);

router.delete('/cart-delete/:prodId', isAuth, productController.removeProductFromCart);

router.put('/cart-qty/:prodId', isAuth, productController.cartQuantityUpdate);

router.get("/wishlist", isAuth, productController.getWishlist);

router.post("/wishlist", isAuth, productController.postWishlist);

router.delete('/wishlist-delete/:prodId', isAuth, productController.removeProductFromWishlist);

router.get("/checkout", isAuth, productController.getCheckout);

router.get("/checkout/success/:sessionId", isAuth, productController.getCheckoutSuccess);

router.get("/checkout/fail", productController.getCheckout);

module.exports = router;