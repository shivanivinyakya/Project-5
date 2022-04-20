const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const cartModel = require("../models/cartModel")
const validation = require("../validation/validator")

const createCart = async function (req, res) {
    try {
        let id = req.params.userId;
        let data = req.body;

        let { userId, items } = data

        if (!validation.isValidObjectId(id)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid userId" })
        }

        if (!validation.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "Please enter some data" })
        }

        if (!validation.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "UserId is required" })
        }

        if (!validation.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid userId" })
        }

        let findUser = await userModel.findById(id)
        if (!findUser) {
            return res.status(404).send({ status: false, msg: "User not Found" })
        }

        let [productId, quantity] = items

        let findCart = await cartModel.findOne({ userId: id })
        if (findCart) {
            let findProduct = await productModel.findOne({ productId }).select({ price: 1, _id: 0 })
            if (!findProduct) {
                return res.status(404).send({ status: true, msg: "Product not found" })
            }
            var getPrice = findProduct.price;

            for (i = 0; i < items.length; i++) {
                if (items[i].quantity > 0)
                    var storePrice = (items[i].quantity * getPrice)
            }

            let cartDetails = {
                userId: userId,
                items: items,
                totalPrice: storePrice,
                totalItems: items.length
            }
            let addCart = await cartModel.findOneAndUpdate({ userId }, { $set: cartDetails }, { new: true })
            return res.send({ status: true, msg: "Cart Added Successfully", data: addCart })
        }
        if (!findCart) {
        
            let findProduct = await productModel.findOne({ productId }).select({ price: 1, _id: 0 })
            if (!findProduct) {
                return res.status(404).send({ status: true, msg: "Product not found" })
            }
            var getPrice = findProduct.price;

            for (i = 0; i < items.length; i++) {
                if (items[i].quantity > 0)
                    var storePrice = (items[i].quantity * getPrice)
            }

            let cartDetails = {
                userId: userId,
                items: items,
                totalPrice: storePrice,
                totalItems: items.length
            }
            let document = await cartModel.create(cartDetails)
            return res.status(201).send({ status: true, msg: "Cart Created Successfully", data: document })
        }
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const updateCart = async (req, res) => {
    try {
      let userId = req.params.userId
      //validation starts.
      if (!validation.isValidObjectId({userId})){
        res.status(400).send({ status: false, message: "Invalid userId in body" });
        return 
      }
      let findUser = await userModel.findOne({ _id: req.params.userId });
      
      if (!findUser){
        res.status(400) .send({ status: false, message: "UserId does not exits" });
        return
      }
      const { cartId, productId, removeProduct } = req.body;
      if (!validation.isValidRequestBody(req.body))
        return res.status(400).send({ status: false,message: "Invalid request parameters. Please provide cart details.",});

  
      //cart validation
      if (!validation.isValidObjectId(cartId)) {
        return res .status(400).send({ status: false, message: "Invalid cartId in body" });
      }
      let findCart = await cartModel.findById({ _id: cartId });
      if (!findCart){
        return res.status(400).send({ status: false, message: "cartId does not exists" });
      }
      //product validation
      if (!validation.isValidObjectId(productId)){
        return res.status(400).send({ status: false, message: "Invalid productId in body" });
      }
      let findProduct = await productModel.findOne({_id: productId,isDeleted: false });
      if (!findProduct){
        return res.status(400).send({ status: false, message: "productId does not exists" });
      }
      //finding if products exits in cart
      let isProductinCart = await cartModel.findOne({items:{$elemMatch: { productId: productId}},});
      if (!isProductinCart){
        return res.status(400).send({status: false,message: `product does not exists in the cart`});
      }
      //removeProduct validation either 0 or 1.
      if (!!isNaN(Number(removeProduct)))
        return res.status(400).send({status: false,message: `removeProduct should be a valid number either 0 or 1`});
  
      //removeProduct => 0 for product remove completely, 1 for decreasing its quantity.
      if (!(removeProduct === 0 || 1))
        return res.status(400).send({status: false,message:"removeProduct should be 0 or 1"});
  
      let findQuantity = findCart.items.find((x) => x.productId.toString() === productId);
      //console.log(findQuantity)
  
      if (removeProduct === 0) {
        let totalAmount = findCart.totalPrice - findProduct.price * findQuantity.quantity; // substract the amount of product*quantity
  
    await cartModel.findOneAndUpdate({_id: cartId },{ $pull:{ items:{ productId:productId}}},{new: true});
  
        let quantity = findCart.totalItems - 1;
        let data = await cartModel.findOneAndUpdate({ _id: cartId },{$set:{totalPrice:totalAmount, totalItems: quantity}},{new:true}
        ); //update the cart with total items and totalprice
  
        return res.status(200).send({status: true,message:`Product Id is been removed`,data: data});
      }
  
      // decrement quantity
      let totalAmount = findCart.totalPrice - findProduct.price;
      let itemsArr = findCart.items;
  
      for (i in itemsArr) {
        if (itemsArr[i].productId.toString() == productId) {
          itemsArr[i].quantity = itemsArr[i].quantity - 1;
  
          if (itemsArr[i].quantity<1) {
            await cartModel.findOneAndUpdate({_id: cartId },{$pull: { items: { productId: productId}}},{new: true});
            let quantity = cart.totalItems - 1;
  
         let data = await cartModel.findOneAndUpdate({_id: cartId },{$set: { totalPrice:totalAmount,totalItems:quantity}},{new: true}
            ); //update the cart with total items and totalprice
  
             res.status(200).send({status: true,message: `No such quantity in product exist in cart`,data: data});
             return
            }
        }
      }
      let data = await cartModel.findOneAndUpdate({_id: cartId },{items:itemsArr,totalPrice:totalAmount },{ new: true});
  
       res.status(200).send({status: true,message: `Product Id quantity is been reduced By 1`,data: data});
    } 
    catch (err) {
      return res.status(500).send({status: false,message: err.message });
    }
  };
 
  
  const getFromCart = async (req, res) => {
    try {
      const userIdFromParams = req.params.userId;
      const userIdFromToken = req.userId;
  
      if (!validation.isValid(userIdFromParams)) {
        return res.status(400).send({ status: false, message: "enter the userId" });  }
      if (!validation.isValidObjectId(userIdFromParams)) {
        return res
          .status(400)
          .send({ status: false, message: "enter a valid userId" });
      }
  
      if (!validation.isValidObjectId(userIdFromToken)) {
        return res
          .status(400)
          .send({ status: false, message: "token user id not valid" });
      }
  
      if (userIdFromParams !== userIdFromToken) {
        return res
          .status(400)
          .send({ status: false, message: "user not authorised" });
      }
  
      const user = await userModel.findOne({ _id: userIdFromParams });
  
      if (!user) {
        return res.status(404).send({ status: false, message: "user not found" });
      }
  
      const cart = await cartModel.findOne({
        userId: userIdFromParams,
      });
  
      if (!cart) {
        return res
          .status(404)
          .send({ status: false, message: "cart not found!! add some products" });
      }
      
      res.status(200).send({ status: true,message:"SUCCESS", data: cart });
    } catch (error) {
      res.status(500).send({ status: false, message: error.message });
    }
  };
  //********************************************************************* */
  const deleteCart = async (req, res) => {
    try {
      const userIdFromParams = req.params.userId;
      const userIdFromToken = req.userId;
  
      if (!validation.isValid(userIdFromParams)) {
        return res
          .status(400)
          .send({ status: false, message: "enter the userId" });
      }
      if (!validation.isValidObjectId(userIdFromParams)) {
        return res
          .status(400)
          .send({ status: false, message: "enter a valid userId" });
      }
  
      if (!validation.isValidObjectId(userIdFromToken)) {
        return res
          .status(400)
          .send({ status: false, message: "token user id not valid" });
      }
  
      if (userIdFromParams !== userIdFromToken) {
        return res
          .status(400)
          .send({ status: false, message: "user not authorised" });
      }
  
      const user = await userModel.findOne({ _id: userIdFromParams });
  
      if (!user) {
        return res.status(404).send({ status: false, message: "user not found" });
      }
  
      const deletedCart = await cartModel.findOneAndUpdate(
        {
          userId: userIdFromParams,
        },
        { $set: { items: null, totalItems: 0, totalPrice: 0 } },
        { new: true }
      );
  
      if (!deletedCart) {
        return res
          .status(404)
          .send({ status: false, message: "cart not found!! add some products" });
      }
  
      res.status(200).send({ status: true,message:"SUCCESS", data: deletedCart });
    } catch (error) {
      res.status(500).send({ status: false, message: error.message });
    }
  };
  
  
  
  module.exports.createCart = createCart
  module.exports.updateCart=updateCart
  module.exports.getFromCart=getFromCart
  module.exports.deleteCart=deleteCart