import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  UserRound,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Tasks",
    path: "/tasks",
    icon: CheckSquare,
  },
  {
    name: "Teams",
    path: "/teams",
    icon: Users,
  },
  {
    name: "Users",
    path: "/users",
    icon: UserRound,
  },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          h-screen w-64
          border-r border-gray-200
          bg-white
          shadow-xl
          transition-transform duration-200

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0
          lg:shadow-none
        `}
      >
        <div className="flex h-full flex-col">

          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
                PH
              </div>

              <div>
                <h1 className="text-sm font-bold tracking-tight text-gray-900">
                  Project Hub
                </h1>

                <p className="text-[11px] text-gray-500">
                  Project Management
                </p>
              </div>

            </div>

            {/* Mobile close */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={19} />
            </button>

          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-5">

            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Workspace
            </p>

            <div className="space-y-1">

              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `
                      group flex items-center gap-3
                      rounded-lg px-3 py-2.5
                      text-sm font-medium
                      transition-all duration-150

                      ${
                        isActive
                          ? "bg-black text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }
                      `
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={18}
                          strokeWidth={isActive ? 2.2 : 1.9}
                        />

                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}

            </div>

          </nav>

          {/* Footer */}
          <div className="shrink-0 border-t border-gray-200 px-4 py-4">

            <p className="text-xs font-medium text-gray-500">
              Multi-Tenant Project Hub
            </p>

            <p className="mt-0.5 text-[11px] text-gray-400">
              Workspace management
            </p>

          </div>

        </div>
      </aside>
    </>
  );
}