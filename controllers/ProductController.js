const Product = require('../models/Product');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path'); 


exports.addProduct = async (req, res) => {
    try {
        const { itemName, description, price, brand, category } = req.body;
        const imageUrl = req.file ? `/Images/Products/${req.file.filename}` : '';


        if (!itemName || !description || !price) {
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting uploaded file due to validation failure:', err);
                });
            }
            console.error('Validation Error: Missing required product fields (name, description, price).');
            return res.status(400).json({ success: false, message: 'Name, description, and price are required.' });
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting uploaded file due to price validation failure:', err);
                });
            }
            console.error('Validation Error: Price is not a valid positive number. Received:', price);
            return res.status(400).json({ success: false, message: 'Price must be a valid positive number.' });
        }

        const productQuantity = 0; 

        const newProduct = new Product({
            name: itemName,
            description: description,
            price: parsedPrice,
            quantity: productQuantity,
            brand: brand || 'Unknown',
            category: category || 'Uncategorized',
            images: imageUrl ? [imageUrl] : [], 
            mainImage: imageUrl 
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: 'Product added successfully!', product: newProduct });

    } catch (err) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting uploaded file due to server error:', err);
            });
        }
        console.error('DATABASE SAVE ERROR - Product addition failed:', err);

        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('; ') });
        }
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'A product with this name (or other unique field) already exists.' });
        }

        res.status(500).json({ success: false, message: 'Server error while adding product: ' + err.message, error: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const { search, category } = req.query;

        
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 9; 
        const skip = (page - 1) * limit;

        let filter = {};

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { name: searchRegex },
                { brand: searchRegex }
            ];
        }

        if (category && category !== 'All') {
            filter.category = category;
        }

        const products = await Product.find(filter)
                                    .skip(skip)
                                    .limit(limit);

        const totalProducts = await Product.countDocuments(filter);

        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            products,
            currentPage: page,
            totalPages,
            totalProducts,
            limit
        });

    } catch (err) {
        console.error('Error fetching products with filters and pagination:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching products.', error: err.message });
    }
};


exports.getAllProductsAdmin = async (req, res) => {
    try {
        
        const products = await Product.find({});
        res.status(200).json(products); 
    } catch (err) {
        console.error('Error fetching all products for admin:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching all products for admin.', error: err.message });
    }
};


exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            console.error('Validation Error: Invalid product ID format:', id);
            return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
        }

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            console.warn('Product not found for deletion with ID:', id);
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        
        if (deletedProduct.mainImage) {
            const imagePath = path.join(__dirname, '../public', deletedProduct.mainImage);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete image file: ${imagePath}`, err);
                }
            });
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully!', product: deletedProduct });

    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ success: false, message: 'Server error while deleting product.', error: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id;

       
        if (!mongoose.isValidObjectId(productId)) {
            console.warn('Invalid product ID format received:', productId);
            return res.status(400).render('404'); 
        }

        const product = await Product.findById(productId);

        if (!product) {
            console.warn('Product not found for ID:', productId);
            return res.status(404).render('404'); 
        }

        
        res.render('ProductDetails', { product });
    } catch (err) {
        console.error('Error fetching product by ID:', err);
        res.status(500).send('Server error while fetching product details.');
    }
};