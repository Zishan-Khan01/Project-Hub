import {
  Menu,
  LogOut,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({
  onMenuClick,
}: TopbarProps) {
  const { user, logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  useEffect(() => {
    if (!showLogoutModal) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showLogoutModal]);

  function handleLogoutClick() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    if (loggingOut) return;

    setShowLogoutModal(false);
  }

  async function confirmLogout() {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      console.error(error);
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">

        {/* Left */}
        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={21} />
          </button>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Workspace
            </p>

            <p className="hidden text-xs text-gray-500 sm:block">
              Manage your projects and tasks
            </p>
          </div>

        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {user?.name}
            </p>

            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
              {user?.role?.replaceAll("_", " ")}
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white ring-2 ring-gray-100">
            {initials}
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <button
            type="button"
            onClick={handleLogoutClick}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>

        </div>

      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !loggingOut
            ) {
              closeLogoutModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            {/* Icon */}
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
              <LogOut
                size={21}
                className="text-gray-700"
              />
            </div>

            {/* Title */}
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Log out?
            </h2>

            {/* Description */}
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to log out of your
              Project Hub account?
            </p>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={closeLogoutModal}
                disabled={loggingOut}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                disabled={loggingOut}
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingOut ? "Logging out..." : "Log Out"}
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}