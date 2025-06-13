const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },

    category: {
        type: String, 
        trim: true,
        default: 'Uncategorized'
    },
    brand: {
        type: String,
        trim: true
    },
    images: [{ 
        type: String
    }],
    mainImage: {
        type: String
    },

})
module.exports = mongoose.model('Product', ProductSchema);