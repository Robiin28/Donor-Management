import { NavLink } from "react-router-dom";
import {
  FiUsers,
  FiLayers,
  FiTag,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";

const linkBase =
  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition border";
const inactive =
  "text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent";
const active = "bg-white/5 text-slate-100 border-white/10";

export default function Sidebar() {
  return (
    <aside className="w-[260px] p-5">
      <div className="glass h-full p-5 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-indigo-600/80 grid place-items-center font-bold">
            D
          </div>
          <div>
            <div className="text-sm text-slate-400">CRUD Application</div>
            <div className="font-semibold leading-tight">
              Donor Management
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <NavLink
            to="/donors"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : inactive}`
            }
          >
            <FiUsers size={16} />
            Donors
          </NavLink>

          <NavLink
            to="/segments"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : inactive}`
            }
          >
            <FiLayers size={16} />
            Segments
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : inactive}`
            }
          >
            <FiTag size={16} />
            Categories
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : inactive}`
            }
          >
            <FiBarChart2 size={16} />
            Reports
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : inactive}`
            }
          >
            <FiSettings size={16} />
            Settings
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10" />
            <div>
              <div className="font-medium leading-tight">robii</div>
              <div className="text-xs text-slate-400">Demo Admin</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
