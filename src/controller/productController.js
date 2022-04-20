const productModel = require("../models/productModel")
const validation = require("../validation/validator")
const aws = require("aws-sdk");
const mongoose = require("mongoose");
const Aws = require("../controller/awsController")



let createProduct = async function (req, res) {
    try {
        const data = req.body
        const files = req.files

        
        
        if (!validation.isValid(files)) {
            return res.status(400).send({ status: false, message: "please insert the file" });
        }
        if (!validation.validFile(files[0])) {
            return res.status(400).send({ status: false, msg: "please insert an image in files" });
        }

    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        if (!validation.isValid(title)) {
            return res.status(400).send({ status: false, message: "please provide title" })
        }

        const alreadyTitleUsed = await productModel.findOne({ title: title, isDeleted: false, deletedAt: null })
        if (alreadyTitleUsed) {
            return res.status(400).send({ status: false, message: "title already exists" })
        }
        if (!validation.isValid(description)) {
            return res.status(400).send({ status: false, message: "Please provide product's description" })
        }


        if (!validation.isValid(price)) {
            return res.status(400).send({ status: false, message: "Please provide product's price" })
        }

        if (!validation.isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "Please provide a currencyId" });
        }
        if(!validation.isINR(currencyId)){
            return res.status(400).send({status:false,message:"Please Provide a valid currency INR"})
        }
        if (!validation.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "Please provide a currencyFormat" });
        }
        if(!validation.isRs(currencyFormat)){
            return res.status(400).send({status:false,message:"Please Provide a valid currency Rs"})
        }


        if (!validation.isValid(style)) {
            return res.status(400).send({ status: false, message: "Please provide product's style" })
        }
        if (!validation.isValid(installments)) {
            return res.status(400).send({ status: false, message: "Installment of the product  is required" })
        }
    
        if (!validation.isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "Size is required" })
        }
    
        
        
       if (!validation.isValidSize(availableSizes)){
          return res.status(400).send({ status: false, message: "please provide sizes in between in the ENUM" })
            }
       
       
       
        const ProductImage = await Aws.uploadFiles(files[0])
        if(!ProductImage){
            res.status(400).send({ status: false, msg: "No file found" });
            return;
        }
        const productData = {
            title,
            description,
            price,
            currencyId,
            currencyFormat,
            isFreeShipping,
            productImage: ProductImage,
            style,
            availableSizes,
            installments
        }

        const newProduct = await productModel.create(productData)

        return res.status(201).send({ status: true, message: "success", data: newProduct })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
        return
    }
}


const getProductbyQuery = async function (req, res) {
    try {
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query
        let filters = { isDeleted: false }

        if (size != null) {
            if (!validation.isValidSize(size)) {
                return res.status(400).send({ status: false, msg: 'No Such Size Exist in our Filters ... Select from ["S", "XS", "M", "X", "L", "XXL", "XL"]' })
            }
            filters["availableSizes"] = size
        }

        let arr = []
        if (name != null) {
            const findTitle = await productModel.find({ isDeleted: false }).select({ title: 1, _id: 0 })
            for (let i = 0; i < findTitle.length; i++) {
                var checkTitle = findTitle[i].title

                let check = checkTitle.includes(name)
                if (check) {
                    arr.push(findTitle[i].title)
                }
            }
            filters["title"] = arr
        }



        if (priceGreaterThan != null && priceLessThan == null) {
            filters["price"] = { $gt: priceGreaterThan }
        }

        if (priceGreaterThan == null && priceLessThan != null) {
            filters["price"] = { $lt: priceLessThan }
        }

        if (priceGreaterThan != null && priceLessThan != null) {
            filters["price"] = { $gte: priceGreaterThan, $lte: priceLessThan }
        }



        if (priceSort != null) {
            if (priceSort == 1) {
                const products = await productModel.find(filters).sort({ price: 1 })
                if (products.length == 0) {
                    return res.status(404).send({ status: false, message: "No data found that matches your search" })
                }
                return res.status(200).send({ status: true, message: "Results", count: products.length, data: products })
            }

            if (priceSort == -1) {
                const products = await productModel.find(filters).sort({ price: -1 })
                if (products.length == 0) {
                    return res.status(404).send({ status: false, message: "No data found that matches your search" })
                }
                return res.status(200).send({ status: true, message: "Results", count: products.length, data: products })
            }
        }

        const products = await productModel.find(filters)
        if (products.length == 0) {
            return res.status(404).send({ status: false, message: "No data found that matches your search" })
        }
        return res.status(200).send({ status: true, message: "Results", count: products.length, data: products })

    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getProductById =async function(req,res){
    try{
        let id= req.params.productId
         

        if(!(validation.isValidObjectId(id))){
            return res.status(400).send({status:false,message:"Id is not valid"})
        }

        let findProduct=await productModel.findOne({_id:id,isDeleted:false})
        if(!findProduct){
            return res.status(400).send({status:false,message:"Product is not atched with Id"})
        }
        let getProduct =await productModel.find({_id:id,isdeleted:false,deletedAt:null})
        res.status(200).send({status:true,message:"successfully finding the id",data:getProduct})
    }
    catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

const updateProduct =async function(req,res){
    try{
       let Id = req.params.productId;
       let requestBody=req.body;
       let files =req.files;

       if(!(validation.isValidObjectId(Id))){
           return res.status(400).send({status:false,message:"Please enter the valid id"})
       }

       let details=await productModel.findOne({_id:Id,isDeleted:false});
       if(!details){
           return res.status(404).send({status:false,message:"Details of the product are not found"})
        }
        if (!validation.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: "please provide data " })
            return
        }
        
   const{title,description,price,isFreeShipping,currencyId,currencyFormat,style,availableSizes,installments}=requestBody
        
   
   if (!validation.isValid(title)) {
    return res.status(400).send({ status: false, message: "please enter a valid title" })
}

const alreadyTitleUsed = await productModel.findOne({ title: title, isDeleted: false, deletedAt: null })
if (alreadyTitleUsed) {
    return res.status(400).send({ status: false, message: "title already registered" })
}
if (!validation.isValid(description)) {
    return res.status(400).send({ status: false, message: "Please provide description" })
}
if (!validation.isValid(isFreeShipping)) {
    return res.status(400).send({ status: false, message: "Please provide the value" })
}
if (!validation.isValid(price)) {
    return res.status(400).send({ status: false, message: "Please provide price" })
}

if (!validation.isValid(currencyId)) {
    return res.status(400).send({ status: false, message: "Please provide currencyId" });
}
// if(!validation.isINR(currencyId)){
//     return res.status(400).send({status:false,message:"Please Provide a valid currency INR"})
// }
if (!validation.isValid(currencyFormat)) {
    return res.status(400).send({ status: false, message: "Please provide currencyFormat" });
}
// if(!validation.isRs(currencyFormat)){
//     return res.status(400).send({status:false,message:"Please Provide a valid currency Rs"})
// }


if (!validation.isValid(style)) {
    return res.status(400).send({ status: false, message: "Please provide product's style" })
}
if (!validation.isValid(installments)) {
    return res.status(400).send({ status: false, message: "Please provide every installment" })
}
if (!validation.isValid(availableSizes)) {
    return res.status(400).send({ status: false, message: "Size is required" })
}


// if (!validation.isValidSize(availableSizes)){
//   return res.status(400).send({ status: false, message: "please provide sizes in between in the ENUM" })
//     }


var uploadedFileURL = await Aws.uploadFiles(files[0])
if(!uploadedFileURL){
    res.status(400).send({ status: false, msg: "No file found" });
    return;
}
const priceOfTheProduct ={
    title,description,
    price,isFreeShipping,currencyId,currencyFormat,productImage:uploadedFileURL,
    style,installments
}=await productModel.findOneAndUpdate({_id:productId},{$push:{availableSizes:availableSizes}})

    const updatedProduct=await productModel.findOneAndUpdate({_id:productId},priceOfTheProduct,{new:true})
    res.status(200).send({status:true,message:"successfully updated product",data:updatedProduct})
}
    catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

const productDelete = async function (req,res){
    try{
        const productId = req.params.productId
        if(!validation.isValidObjectId(productId)){
            return res.status(400).send({status: false, message: "please provide valid productId"})
        }
        let deletedData= await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        if(deletedData.isDeleted== true){
            return res.status(400).send({status: false, message: "product has already been deleted"})
        }
        if(deletedData){
            return res.status(200).send({status: true, message: "product deleted successfully"})
        }else{
            return redirect.status(404).send({status: false, message:"Data not found"})
        }
    }catch(error){
        return res.status(500).send({status: false, message:error.message})
    }
}

module.exports.createProduct = createProduct
module.exports.getProductbyQuery=getProductbyQuery
module.exports.getProductById=getProductById
module.exports.updateProduct=updateProduct
module.exports.productDelete=productDelete