exports.isAuthenticated = (req, res, next) => {
  
    if (req.session.userId) {
        next(); 
    } else {
        
        req.session.message = {
            type: 'error-message',
            text: 'Please log in to access this page.'
        };
        res.redirect('/login');
    }
};

exports.isAdmin = (req, res, next) => {
  
    if (req.session.role === 'Admin') {
        next(); 
    } else {
        
        req.session.message = {
            type: 'error-message',
            text: 'You do not have permission to access the admin dashboard.'
        };
        res.redirect('/'); 
    }
};