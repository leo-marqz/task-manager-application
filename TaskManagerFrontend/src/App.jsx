import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import SignIn from './pages/Auth/SignIn'
import SignUp from './pages/Auth/SignUp'
import PrivateRoute from './routes/PrivateRoute'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ManageTasks from './pages/Admin/ManageTasks'
import CreateTask from './pages/Admin/CreateTask'
import ManageUsers from './pages/Admin/ManageUsers'
import UserDashboard from './pages/User/UserDashboard'
import MyTasks from './pages/User/Mytasks'
import ViewTaskDetails from './pages/User/ViewTaskDetails'

export default function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/signin" element={ <SignIn/> } />
          <Route path="/signup" element={ <SignUp/> } />

          {/* Admin Routes */}
          <Route element={ <PrivateRoute allowedRoles={["admin"]} /> } >
            <Route path='/admin/dashboard' element={ <AdminDashboard /> } />
            <Route path='/admin/tasks' element={ <ManageTasks /> } />
            <Route path='/admin/create-task' element={ <CreateTask  /> } />
            <Route path='/admin/users' element={ <ManageUsers /> } />
          </Route>

          {/* User Routes */}
          <Route element={ <PrivateRoute allowedRoles={["admin"]} /> } >
            <Route path='/user/dashboard' element={ <UserDashboard /> } />
            <Route path='/user/my-tasks' element={ <MyTasks /> } />
            <Route path='user/task-details/:id' element={ <ViewTaskDetails /> } />
          </Route>

        </Routes>
      </Router>
    </div>
  )
}
