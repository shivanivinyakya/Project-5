const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    title: {
        type: String,
        required: "title is mandatory",
        unique: "title is unique",
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
    },
    currencyId: {
        type: String,
        required: true,

    },
    currencyFormat: {
        type: String,
        required: true,
        trim: true
    },
    isFreeShipping: {
        type: Boolean,
        default: false
    },
    productImage: {
        type: String,
        required: true
    },//s3 Link
    style: {
        type: String
    },
    availableSizes: {
        type: [String],
        trim:true,
        enum: ["S", "XS", "M", "X", "L", "XXL", "XL"]
    },
    installments: {
        type: Number,
        required:true
    },

    deletedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
},
    { timestamps: true });

module.exports = mongoose.model('product', productSchema);