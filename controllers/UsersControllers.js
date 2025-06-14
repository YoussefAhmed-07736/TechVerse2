const User = require('../modules/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeythatshouldbeverylongandrandom'; 

exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
    }
};

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
        res.status(500).json({ error: 'Server error during registration. Please try again.' });
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
        req.session.userId = user._id;
        req.session.role = user.role;
        req.session.userEmail = user.email; 
        
        const payload = {
            user: {
                id: user._id, 
                role: user.role
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET, 
            { expiresIn: '1h' },
            (err, token) => {
                if (err) {
                    console.error('JWT signing error:', err);
                    throw new Error('Could not generate authentication token.');
                }
                res.json({ message: 'Login successful.', token });
            }
        );

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message || 'Server error during login. Please try again.' });
    }
};

exports.logout = async (req, res) => {
   
    if (!req.session) {
        console.log('No session found. Clearing cookie and redirecting.');
        res.clearCookie('connect.sid');
        return res.redirect('/');
    }

    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            console.error('Session object at time of error:', req.session);
            res.clearCookie('connect.sid');
            return res.status(500).send('An error occurred during logout. Please try again.');
        }
        
        console.log('Session successfully destroyed.');
        res.clearCookie('connect.sid'); 
        console.log('Session cookie cleared.');
        res.redirect('/'); 
    });
};