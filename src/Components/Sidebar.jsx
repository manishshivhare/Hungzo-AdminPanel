import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ArchiveBoxIcon,
  TruckIcon,
  UserGroupIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import logo from "../assets/Logo.png";
import { useAuth } from "../Context/AuthProvider";

/* -------------------- MENU CONFIG -------------------- */

const adminMenu = [
  { to: "/product", label: "My Product", icon: CubeIcon },
  { to: "/Add-product", label: "Add Product", icon: CubeIcon },
  { to: "/orders", label: "Orders", icon: ClipboardDocumentListIcon },
  { to: "/inventory", label: "Inventory", icon: ArchiveBoxIcon },
  { to: "/profile", label: "Profile", icon: UserGroupIcon },
  { to: "/logout", label: "Logout", icon: ArrowRightOnRectangleIcon },
];

const superAdminMenu = [
  { to: "/product", label: "My Product", icon: CubeIcon },
  { to: "/Add-product", label: "Add Product", icon: CubeIcon },
  { to: "/restaurants", label: "Restaurants", icon: BuildingOffice2Icon },
  { to: "/verification", label: "Verification", icon: ClipboardDocumentListIcon },
  { to: "/suppliers", label: "Suppliers", icon: CubeIcon },
  { to: "/inventory", label: "Inventory", icon: ArchiveBoxIcon },
  { to: "/orders", label: "Orders", icon: ClipboardDocumentListIcon },
  { to: "/drivers", label: "Drivers", icon: TruckIcon },
  { to: "/admin", label: "Admins", icon: UserGroupIcon },
  { to: "/add-admin", label: "Add Admin", icon: UserPlusIcon },
  { to: "/logout", label: "Logout", icon: ArrowRightOnRectangleIcon },
];

/* -------------------- SIDEBAR -------------------- */

export default function Sidebar() {
  const { user } = useAuth();

  // safety check (on refresh)
  if (!user) return null;
  // console.log(user);
  
  // role-based menu
  const menuItems =user.role === "SUPERADMIN"  ? superAdminMenu : user.role === "ADMIN" ? adminMenu  : [];

  return (
    <aside className="w-64 bg-[#061D22] text-white h-screen p-6 flex flex-col justify-between">
      {/* -------------------- TOP -------------------- */}
      <div>
        <Link to="/">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={logo}
              alt="logo"
              className="w-[37.13px] h-[37.13px]"
            />
            <div className="font-semibold text-lg">Hungzo</div>
          </div>
        </Link>

        <nav className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-full text-sm transition ${
                    isActive
                      ? "bg-accent text-white"
                      : "bg-white/10 hover:bg-white/20 text-white/80"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="grow">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* -------------------- FOOTER -------------------- */}
      <div className="text-center m-4 flex flex-col items-center">
        <img src={logo} alt="logo" className="w-8 h-8" />
        <div className="mt-2 text-xs text-white/60">
          © 2025 Hungzo Admin Panel
        </div>
      </div>
    </aside>
  );
}
