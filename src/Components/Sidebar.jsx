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
  BellAlertIcon,
  BuildingStorefrontIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import logo from "../assets/Logo.png";
import { useAuth } from "../Context/AuthProvider";
import { AlertTriangle, Scale, Wallet, } from "lucide-react";

/* -------------------- MENU CONFIG -------------------- */

const adminMenu = [
  { to: "/orders", label: "Orders", icon: ClipboardDocumentListIcon },
  { to: "/product", label: "My Product", icon: CubeIcon },
  { to: "/Add-product", label: "Add Product", icon: CubeIcon },
  // { to: "/profile", label: "Profile", icon: UserGroupIcon },
  { to: "/banner", label: "Banner", icon: ArchiveBoxIcon },
  { to: "/warehouse", label: "Warehouse", icon: BuildingStorefrontIcon },
  { to: "/business-hours", label: "Business Hours", icon: ClockIcon },
  { to: "/notification", label: "notification", icon: BellAlertIcon },
  { to: "/Terms", label: "(T&Cs)", icon: Scale },
  { to: "/logout", label: "Logout", icon: ArrowRightOnRectangleIcon },
];

const superAdminMenu = [
  { to: "/product", label: "All Product", icon: CubeIcon },
  { to: "/Add-product", label: "Add Product", icon: CubeIcon },
  { to: "/restaurants", label: "Users", icon: BuildingOffice2Icon },
  { to: "/verification", label: "Verification", icon: ClipboardDocumentListIcon },
  { to: "/orders", label: "Orders", icon: ClipboardDocumentListIcon },
  { to: "/drivers", label: "Drivers", icon: TruckIcon },
  { to: "/admin", label: "Admins", icon: UserGroupIcon },
  { to: "/add-admin", label: "Add Admin", icon: UserPlusIcon },
  { to: "/banner", label: "Banner", icon: ArchiveBoxIcon },
  { to: "/warehouse", label: "Warehouse", icon: BuildingStorefrontIcon },
  { to: "/business-hours", label: "Business Hours", icon: ClockIcon },
  { to: "/notification", label: "notification", icon: BellAlertIcon },
  { to: "/walletDetails", label: "Wallet", icon: Wallet },
  { to: "/Terms", label: "(T&Cs)", icon: Scale },
  { to: "/logout", label: "Logout", icon: ArrowRightOnRectangleIcon },
];

/* -------------------- SIDEBAR -------------------- */

export default function Sidebar() {
  const { user } = useAuth();

  // safety check (on refresh)
  if (!user) return null;

  // role-based menu
  const menuItems = user.role === "SUPERADMIN" ? superAdminMenu : user.role === "ADMIN" ? adminMenu : [];

  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 bg-[#0a0b0bde] px-6 py-7 text-white">
      {/* -------------------- TOP -------------------- */}
      <div className="flex h-full flex-col">
        <Link to="/">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={logo}
              alt="logo"
              className="w-[37.13px] h-[37.13px]"
            />
            <div className="font-semibold text-lg">Hungzo</div>
          </div>
        </Link>

        {/* Scrollable navigation with hidden scrollbar */}
        <div
          className="min-h-0 flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
        >
          <nav className="space-y-2 pr-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-full text-sm transition ${isActive
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
        <div className="mt-auto pt-6 text-center flex flex-col items-center">
          <img src={logo} alt="logo" className="w-8 h-8" />
          <div className="mt-2 text-xs text-white/60">
            © {new Date().getFullYear()} Hungzo Admin Panel
          </div>
        </div>
      </div>
      
      {/* Inline CSS for Webkit browsers (Chrome, Safari, Edge) */}
      <style>{`
        /* Hide scrollbar for Webkit browsers */
        div[style*="scrollbar-width: none"]::-webkit-scrollbar {
          display: none !important;
        }
        
        /* Hide scrollbar for all browsers */
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </aside>
  );
}
