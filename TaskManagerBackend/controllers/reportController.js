
import { Task } from '../models/task.js';
import { User } from '../models/user.js';

class ReportController {

    constructor(){} 

    static async exportTasksReport(req, res){
        try {
            //
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async exportUsersReport(req, res){
        try {
            //
        } catch (error) { 
            res.status(500).json({ message: error.message });
        }
    }
}

export { ReportController };