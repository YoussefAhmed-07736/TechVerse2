const User = require('../models/Users'); 
const Product = require('../models/Product');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeythatshouldbeverylongandrandom';


exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        
        const user = new User({ email, password });
        await user.save(); 

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: err.message || 'Server error during registration. Please try again.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message || 'Server error during login. Please try again.' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
       
        const users = await User.find().select('-password');

        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Server error while fetching users.' });
    }
};


exports.changeUserRole = async (req, res) => {
    const userId = req.params.id; 
    const { newRole } = req.body; 

   
    const allowedRoles = ['Customer', 'Admin']; 
    if (!userId || !newRole || !allowedRoles.includes(newRole)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID or role provided.' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        user.role = newRole;
        await user.save(); 

        res.json({ success: true, message: `User role updated to "${newRole}" successfully.` });
    } catch (err) {
        console.error('Error changing user role:', err);
        res.status(500).json({ success: false, message: 'Failed to update user role.' });
    }
};


exports.removeUser = async (req, res) => {
    const userId = req.params.id; 

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    try {
        const result = await User.findByIdAndDelete(userId);

        if (!result) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, message: 'User removed successfully.' });
    } catch (err) {
        console.error('Error removing user:', err);
        res.status(500).json({ success: false, message: 'Failed to remove user.' });
    }
};


exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}); 
        res.json(products); 
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Server error while fetching products.' });
    }
};

exports.deleteProduct = async (req, res) => {
    const productId = req.params.id; 

    if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    try {
        const result = await Product.findByIdAndDelete(productId); 

        if (!result) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        res.json({ success: true, message: 'Product removed successfully.' });
    } catch (err) {
        console.error('Error removing product:', err);
        res.status(500).json({ success: false, message: 'Failed to remove product.' });
    }
};


exports.getAdminDashboard = (req, res) => {
    res.render('AdminDashboard');
};
