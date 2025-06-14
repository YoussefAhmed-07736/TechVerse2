const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const AdminController = require('../controllers/AdminController'); 

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/Images/Products'));
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', AdminController.getAdminDashboard);
router.post('/add-product', upload.single('productImage'), ProductController.addProduct);
router.get('/products', AdminController.getAllProducts);
router.delete('/delete-product/:id', AdminController.deleteProduct);
router.get('/users', AdminController.getAllUsers);
router.post('/users/:id/change-role', AdminController.changeUserRole);
router.delete('/users/:id/remove', AdminController.removeUser);

module.exports = router;
