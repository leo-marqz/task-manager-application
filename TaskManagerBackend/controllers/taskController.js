
import Task from '../models/Task.js';

class TaskController {

    constructor(){}

    /**
     * @desc Get dashboard data for admin
     * @route GET /api/v1/tasks/dashboard-data
     * @access Private (Admin only)
     */
    static async getDashboardData(req, res) {
        try {
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    /**
     * @desc Get dashboard data for user
     * @route GET /api/v1/tasks/user-dashboard-data
     * @access Private (User only)
     */
    static async getUserDashboardData(req, res) {
        try {
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    /**
     * @desc Get all tasks
     * @route GET /api/b1/tasks
     * @access Private (Admin: all, User: assigned) 
     */
    static async getAllTasks(req, res) {
         try {
            // ?status=Pending
            // ?status=In Progress
            // ?status=Completed
            const { status } = req.query;
            let filter = {};

            if(status){
                filter.status = status;
            }

            let tasks = [];

            if(req.user.role === 'admin'){
                tasks = await Task.find(filter).populate('assignedTo', 'name email profileImageUrl');
            }else{
                tasks = await Task.find({...filter, assignedTo: req.user._id })
                .populate('assignedTo', 'name email profileImageUrl'); 
            }

            tasks = await Promise.all(
                tasks.map(async (task)=>{
                    const completedCount = task.todoChecklist
                            .filter(item => item.completed).length;
                    return {
                        ...task._doc,
                        completedTodoCount: completedCount
                    }
                })
            );

            const allTasks = await Task.countDocuments(
                req.user.role === 'admin' ? {} : { assignedTo: req.user._id }
            );

            const pendingTasks = await Task.countDocuments({
                ...filter, 
                status: 'Pending', 
                ...(req.user.role !== 'admin' && { assignedTo: req.user._id })
            });

            const inProgressTasks = await Task.countDocuments({
                ...filter, 
                status: 'In Progress', 
                ...(req.user.role !== 'admin' && { assignedTo: req.user._id })
            });

            const completedTasks = await Task.countDocuments({
                ...filter, 
                status: 'Completed', 
                ...(req.user.role !== 'admin' && { assignedTo: req.user._id })
            });

            res.json({
                summary:{
                    total: allTasks,
                    pending: pendingTasks,
                    inProgress: inProgressTasks,
                    completed: completedTasks
                },
                tasks
            });

        }catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    /**
     * @desc Get task by ID
     * @route GET /api/v1/tasks/:id
     * @access Private (Admin: all, User: assigned)
     */
    static async getTaskById(req, res) {
       try {
        const { id } = req.params;
        const task = await Task.findById(id)
            .populate('assignedTo', 'name email profileImageUrl')
            .populate('createdBy', 'name email profileImageUrl');

        if(!task){
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);

       } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
       }
    }

    /**
     * @desc Create a new task
     * @route POST /api/v1/tasks
     * @access Private (Admin only)
     */
    static async createTask(req, res) {
        try {
            const {
                title, description, priority, 
                dueDate, assignedTo, attachments, 
                todoChecklist
            } = req.body;

            if(!Array.isArray(assignedTo)){
                return res.status(400).json({ message: 'AssignedTo must be an array of user IDs'});
            }

            const task = await Task.create({
                title, 
                description, 
                priority, 
                dueDate, 
                assignedTo, 
                createdBy: req.user._id,
                attachments, 
                todoChecklist
            });

            res.status(201).json({ message: 'Task created successfully', task });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    /**
     * @desc Update task details
     * @route PUT /api/v1/tasks/:id
     * @access Private
     */
    static async updateTask(req, res) {
        try {
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    /**
     * @desc Delete a task
     * @route DELETE /api/v1/tasks/:id
     * @access Private (Admin only)
     */
    static async deleteTask(req, res) {
        try {
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    /**
     * @desc Update task status
     * @route PUT /api/v1/tasks/:id/status
     * @access Private
     */
    static async updateTaskStatus(req, res) {
        try {
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    /**
     * @desc Update task checklist
     * @route PUT /api/v1/tasks/:id/todo
     * @access Private
     */
    static async updateTaskChecklist(req, res) {
        try {
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

export { TaskController };