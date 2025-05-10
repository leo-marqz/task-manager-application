
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    try {
        
        let token = req.headers.authorization;

        if(token && token.startsWith('Bearer')) {
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id) // Find the user by ID
                                .select('-password'); // Exclude password from the user object

            next(); // Proceed to the next middleware or route handler

        }else{
            res.status(401).json({
                message: 'Not authorized, no token'
            });
        }
    } catch (error) {
        res.status(401).json({
                message: 'Not authorized, token failed',
                error: error.message
            });
    }
}

const adminOnly = (req, res, next) => {
    if(req.user && req.user.role === 'admin') {
        next(); // Proceed to the next middleware or route handler
    }else{
        res.status(403).json({
            message: 'Not authorized as an admin'
        });
    }
}

export { protect, adminOnly };