import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import Projects from "./pages/Projects";

import Teams from "./pages/Teams";

import Tasks from "./pages/Tasks";

import Users from "./pages/Users";

import Kanban from "./pages/Kanban";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/projects"
              element={<Projects />}
            />

            <Route
  	      path="/tasks"
	      element={<Tasks />}
	    />

            <Route
  	      path="/teams"
	      element={<Teams />}
	    />

            <Route
  	      path="/users"
	      element={<Users />}
	    />

	    <Route
  	      path="/projects/:projectId/kanban"
  	      element={<Kanban />}
	    />
          </Route>

          {/* Default */}
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}