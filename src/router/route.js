const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController')
const verfication=require('../middleware/userVerify')
const ProductController=require("../controller/productController")
const CartController =require("../controller/cartController")
const OrderController =require("../controller/orderController")

//User
router.post("/register" , UserController.registerUser)
router.post("/login",UserController.userLogin)
router.get("/user/:userId/profile",verfication.userVerify,UserController.getUser)
router.put("/user/:userId/profile",verfication.userVerify,UserController.updateUser)

//Product
router.post("/products",ProductController.createProduct)
router.get("/products",ProductController.getProductbyQuery)
router.get("/products/:productId",ProductController.getProductById)
router.put("/products/:productId",ProductController.updateProduct)
router.delete("/products/:productId",ProductController.productDelete)

//Cart
router.post("/users/:userId/cart",verfication.userVerify,CartController.createCart)
router.put("/users/:userId/cart",verfication.userVerify,CartController.updateCart)
router.get("/users/:userId/cart",verfication.userVerify,CartController.getFromCart)
router.delete("/users/:userId/cart",verfication.userVerify,CartController.deleteCart)

//Order
router.post("/users/:userId/orders",verfication.userVerify,OrderController.createOrder)
router.put("/users/:userId/orders",verfication.userVerify,OrderController.updateOrder)



module.exports=router;