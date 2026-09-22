import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Link
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

import AppLayout from "./components/layout/AppLayout";

import Projects from "./pages/Projects";

import Teams from "./pages/Teams";

import Tasks from "./pages/Tasks";

import Users from "./pages/Users";

import Kanban from "./pages/Kanban";

function PlaceholderPage({
  title,
}: {
  title: string;
}) {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {title}
        </h1>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8">
          <p className="text-gray-500">
            This section will be built next.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

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