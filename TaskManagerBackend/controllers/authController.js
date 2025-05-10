import color from 'picocolors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId)=> jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: '7d'});

class AuthController {

    constructor() {}
    
    /**
     * @desc Sign up a new user
     * @route POST /api/v1/auth/signup
     * @access Public 
     */
    static async signUp(req, res) {
        try{

            const { name, email, password, profileImageUrl, adminInviteToken } = req.body;

            // Check if user already exists
            const userExists = await User.findOne({ email });

            if(userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Determine user role: Admin if correct token is provided, otherwise User
            let role = 'member';
            if(adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN) {
                role = 'admin';
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const newUser = await User.create({
                name,
                email,
                password: hashedPassword,
                profileImageUrl,
                role
            });

            // Return user data with token
            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    profileImageUrl: newUser.profileImageUrl,
                    role: newUser.role,
                    token: generateToken(newUser._id)
                }
            });

        }catch(err){
            console.error( color.red('Error in signUp:'), err);
            res.status(500).json({message: 'Server error', error: err.message});
        }
    }
    
    /**
     * @desc Sign in a user
     * @route POST /api/v1/auth/signin
     * @access Public
     */
    static async signIn(req, res) {
        res.json({
            message: 'Sign in successful',
        });
    }

    /**
     * @desc Sign out a user
     * @route POST /api/v1/auth/signout
     * @access Private (Optional)
     */
    static async signOut(req, res) {
        res.json({
            message: 'Sign out successful',
        });
    }

    /**
     * @desc Get user profile
     * @route GET /api/v1/auth/profile
     * @access Private (Requires authentication)
     */
    static async getProfile(req, res) {
        res.json({
            message: 'User profile retrieved successfully',
        });
    }

    /**
     * @desc Update user profile
     * @route PUT /api/v1/auth/profile
     * @access Private (Requires authentication)
     */
    static async updateProfile(req, res) {
        res.json({
            message: 'User profile updated successfully',
        });
    }

}

export { AuthController };

