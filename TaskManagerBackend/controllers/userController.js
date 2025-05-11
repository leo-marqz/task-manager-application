import User from '../models/User.js';
import Task from '../models/Task.js';
import bcrypt from 'bcryptjs';

class UserController {

    constructor(){}

    /**
     * @desc    Get all users (Admin Only)
     * @route   GET /api/v1/users
     * @access  Private (Admin)
     */
    static async getAllUsers(req, res) {
        try {
            const users = await User.find({role: 'member'}).select('-password');
            const usersWithTaskCounts = await Promise.all(users.map(async (user)=>{
                const pendingTasks = await Task.countDocuments({ user: user._id, status: 'Pending' });
                const inProgressTasks = await Task.countDocuments({ user: user._id, status: 'In Progress' });
                const completedTasks = await Task.countDocuments({ user: user._id, status: 'Completed' });
                return {
                    ...user._doc,
                    tasks: {
                        pending: pendingTasks,
                        inProgress: inProgressTasks,
                        completed: completedTasks
                    }
                };
            }));

            res.json(usersWithTaskCounts);

        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    /**
     * @desc    Get user by ID (Admin Only)
     * @route   GET /api/v1/users/:id
     * @access  Private (Admin)
     */
    static async getUserById(req, res) {
        const { id } = req.params;
        try {
            //
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    /**
     * @desc    Delete user (Admin Only)
     * @route   DELETE /api/v1/users/:id
     * @access  Private (Admin)
     */
    static async deleteUser(req, res) {
        const { id } = req.params;
        try {
            //
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

export { UserController };