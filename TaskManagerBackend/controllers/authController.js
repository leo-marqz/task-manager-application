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
                    _id: newUser._id,
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
        try{
            const { email, password } = req.body;

            const user = await User.findOne({ email });

            if(!user){
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch){
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            return res.status(200).json({
                message: 'Sign in successful',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profileImageUrl: user.profileImageUrl,
                    role: user.role,
                    token: generateToken(user._id)
                }
            });
            
        }catch(err){
            console.error( color.red('Error in signIn: '), err);
            res.status(500).json({message: 'Server error', error: err.message});
        }
    }

    /**
     * @desc Get user profile
     * @route GET /api/v1/auth/profile
     * @access Private (Requires authentication)
     */
    static async getProfile(req, res) {
        try{
            const user = await User.findById(req.user.id).select('-password');

            if(!user){
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user);

        }catch(err){
            console.error( color.red('Error in getProfile: '), err);
            res.status(500).json({message: 'Server error: ', error: err.message});
        }
    }

    /**
     * @desc Update user profile
     * @route PUT /api/v1/auth/profile
     * @access Private (Requires authentication)
     */
    static async updateProfile(req, res) {
        try{
            const user = await User.findById(req.user.id);

            if(!user){
                return res.status(404).json({ message: 'User not found' });
            }
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.profileImageUrl = req.body.profileImageUrl || user.profileImageUrl;

            if(req.body.password){
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                message: 'Profile updated successfully',
                user: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    profileImageUrl: updatedUser.profileImageUrl,
                    role: updatedUser.role,
                    token: generateToken(updatedUser._id)
                }
            });

        }catch(err){
            console.error( color.red('Error in updateProfile: '), err);
            res.status(500).json({message: 'Server error: ', error: err.message});
        }
    }

    /**
     * @desc Upload user image
     * @route POST /api/v1/auth/upload-image
     * @access Private (Requires authentication)
     */
    
    static async uploadImage(req, res){
        try{

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

            console.log(`Image URL: ${color.green(imageUrl)}`);

            res.status(200).json({ message: 'Image uploaded successfully', imageUrl });

        }catch(err){

            console.error('Error in uploadImage: ', err);

            return res.status(500).json({ message: 'Server error: ', error: err.message });
        }
    }

}

export { AuthController };

