
import color from 'picocolors';
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
            const totalTasks = await Task.countDocuments();
            const pendingTasks = await Task.countDocuments({ status: 'Pending' });
            const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
            const completedTasks = await Task.countDocuments({ status: 'Completed' });
            const overdueTasks = await Task.countDocuments({
                dueDate: { $lt: new Date() },
                status: { $ne: 'Completed' }
            });
            
            const taskStatuses = ['Pending', 'In Progress', 'Completed'];

            const taskDistrubutionRaw = await Task.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const taskDistribution = taskStatuses.reduce((acc, status)=>{

                const formattedKey = status.replace(/\s+/g, ''); // Remove spaces

                acc[formattedKey] =  taskDistrubutionRaw.find((item)=>{
                    return item._id === status;
                })?.count || 0;
                
                return acc;

            }, {});

            taskDistribution['All'] = totalTasks;

            const taskPriorities = ['Low', 'Medium', 'High'];
            const taskPriorityLevelRaw = await Task.aggregate([
                {
                    $group: {
                        _id: '$priority',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const taskPriorityLevels = taskPriorities.reduce((acc, priority)=>{

                acc[priority] =  taskPriorityLevelRaw.find((item)=>{
                    return item._id === priority;
                })?.count || 0;
                
                return acc;
            }, {});

            const recentTasks = await Task.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .select(' title status priority dueDate createdAt');

            res.status(200).json({
                statistics: {
                    totalTasks,
                    pendingTasks,
                    inProgressTasks,
                    completedTasks,
                    overdueTasks
                },
                charts: {
                    taskDistribution,
                    taskPriorityLevels
                },
                recentTasks
            });

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
            const userId = req.user._id; // Only fetch data for the logged-in user

            // Fetch statistics for user-specific tasks
            const totalTasks = await Task.countDocuments({ assignedTo: userId });
            const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: 'Pending' });
            const inProgressTasks = await Task.countDocuments({ assignedTo: userId, status: 'In Progress' });
            const completedTasks = await Task.countDocuments({ assignedTo: userId, status: 'Completed' });
            const overdueTasks = await Task.countDocuments({
                assignedTo: userId,
                dueDate: { $lt: new Date() },
                status: { $ne: 'Completed' }
            });

            //Task distribution
            const taskStatuses = ['Pending', 'In Progress', 'Completed'];
            const taskDistributionRaw = await Task.aggregate([
                {$match: { assignedTo: userId } },
                {$group: { _id: "$status", count: { $sum: 1 } }}
            ]);
            
            const taskDistribution = taskStatuses.reduce((acc, status)=>{
                const formattedKey = status.replace(/\s+/g, "");
                acc[formattedKey] = taskDistributionRaw.find((item)=> item._id === status)?.count || 0;
                return acc;
            }, {});

            taskDistribution["All"] = totalTasks;

            const taskPriorities = ["Low", "Medium", "High"];

            const taskPriorityLevelsRaw = await Task.aggregate([
                { $match: { assignedTo: userId } },
                { $group: { _id: "$priority", count: { $sum: 1 } } },
            ]);

            const taskPriorityLevels = taskPriorities.reduce((acc, priority)=>{
                acc[priority] = taskPriorityLevelsRaw.find((item)=> item._id === priority)?.count || 0;
                return acc;
            }, {});

            //Fetch recent 10 tasks for the logged-in user
            const recentTasks = await Task.find({ assignedTo: userId })
                                        .sort({ createdAt: -1 })
                                        .limit(10)
                                        .select("title status priority dueDate createdAt");
            
            res.status(200).json({
                statistics: {
                    total: totalTasks,
                    pending: pendingTasks,
                    inProgress: inProgressTasks,
                    completed: completedTasks,
                    overdue: overdueTasks
                },
                charts: {
                    taskDistribution,
                    taskPriorityLevels,
                },
                recentTasks
            });

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
                        completedTodoCount: completedCount,
                        completedTodoProgress: Math.round((completedCount / task.todoChecklist.length) * 100) + ' %',
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
            const { id } = req.params; // Task ID
            const task = await Task.findById(id);

            if(!task) return res.status(404).json({ message: 'Task not found' });

            task.title = req.body.title || task.title;
            task.description = req.body.description || task.description;
            task.priority = req.body.priority || task.priority;
            task.dueDate = req.body.dueDate || task.dueDate;
            task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
            task.attachments = req.body.attachments || task.attachments;

            if(req.body.assignedTo){
                if(!Array.isArray(req.body.assignedTo)){
                    return res.status(400).json({ message: 'AssignedTo must be an array of user IDs'});
                }
                task.assignedTo = req.body.assignedTo;
            }

            const updatedTask = await task.save();

            res.json({ message: 'Task updated successfully', task: updatedTask });

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

            const { id } = req.params; // Task ID

            const task = await Task.findById(id);

            if(!task) return res.status(404).json({ message: 'Task not found' });
            
            await task.deleteOne();

            res.json({ message: 'Task deleted successfully' });

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
            
            const task = await Task.findById(req.params.id);

            if(!task) return res.status(404).json({ message: 'Task not found' });

            const isAssignedTo = task.assignedTo.some(
                userId => userId.toString() === req.user._id.toString()
            );

            if(!isAssignedTo && req.user.role !== 'admin') 
                return res.status(403).json({ message: 'Not Authorized' });

            task.status = req.body.status || task.status;

            if(task.status === 'Completed'){
                task.todoChecklist.forEach((todo)=>(todo.completed = true));
                task.progress = 100;
            }

            await task.save();

            res.json({ message: 'Task status updated!', task });
            
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
            const { id } = req.params; // Task ID
            const { todoChecklist } = req.body; 

            const task = await Task.findById(id);

            if(!task) return res.status(404).json({ message: 'Task not found!' });

            if( task.assignedTo.includes(req.user._id) && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not Authorized to update checklist!' });
            }

            if(!todoChecklist || !Array.isArray(todoChecklist)){
                console.log( color.red(todoChecklist) );
                return res.status(400).json({ message: 'Todo checklist must be an array' });
            }

            task.todoChecklist = todoChecklist ?? task.todoChecklist;

            const completedCount = task.todoChecklist.filter((todo)=>todo.completed).length;
            const totalTodos = task.todoChecklist.length;
            task.progress =  totalTodos > 0 ? Math.round((completedCount / totalTodos) * 100) : 0;

            if(task.progress === 100){
                task.status = 'Completed';
            }else if(task.progress > 0) {
                task.status = 'In Progress';
            }else{
                task.status = 'Pending';
            }

            await task.save();

            const updatedTask = await Task.findById(id)
                .populate('assignedTo', 'name email profileImageUrl')

            res.json({ message: 'Task checklist updated!', task: updatedTask });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

export { TaskController };