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
  DocumentTextIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import logo from "../assets/Logo.png";
import { useAuth } from "../Context/AuthProvider";
import { Gift, Scale, Wallet } from "lucide-react";

/* -------------------- MENU CONFIG -------------------- */

const adminMenu = [
  {
    label: "Products",
    icon: CubeIcon,
    children: [
      { to: "/product/inventory", label: "Inventory", icon: CubeIcon },
      { to: "/product/add", label: "Add Products", icon: CubeIcon },
      { to: "/product/categories", label: "Category Management", icon: CubeIcon },
    ],
  },
  { to: "/orders", label: "Orders", icon: ClipboardDocumentListIcon },
  {
    label: "Users",
    icon: BuildingOffice2Icon,
    children: [
      {
        to: "/users/deletion-requests",
        label: "Deletion Requests",
        icon: DocumentTextIcon,
      },
    ],
  },
  // { to: "/profile", label: "Profile", icon: UserGroupIcon },
  { to: "/banner", label: "Banner", icon: ArchiveBoxIcon },
  { to: "/warehouse", label: "Warehouse", icon: BuildingStorefrontIcon },
  { to: "/business-hours", label: "Business Hours", icon: ClockIcon },
  { to: "/app-configuration", label: "App Configuration", icon: Cog6ToothIcon },
  { to: "/policies", label: "Policies", icon: DocumentTextIcon },
  { to: "/legal-details", label: "Legal Details", icon: DocumentTextIcon },
  { to: "/notification", label: "notification", icon: BellAlertIcon },
  {
    label: "Offers",
    icon: Gift,
    children: [{ to: "/offers/wallet", label: "Wallet Offers", icon: Wallet }],
  },
  { to: "/Terms", label: "(T&Cs)", icon: Scale },
  { to: "/logout", label: "Logout", icon: ArrowRightOnRectangleIcon },
];

const superAdminMenu = [
  {
    label: "Products",
    icon: CubeIcon,
    children: [
      { to: "/product/inventory", label: "Inventory", icon: CubeIcon },
      { to: "/product/add", label: "Add Products", icon: CubeIcon },
      { to: "/product/categories", label: "Category Management", icon: CubeIcon },
    ],
  },
  { to: "/orders", label: "Orders", icon: ClipboardDocumentListIcon },
  {
    label: "Users",
    icon: BuildingOffice2Icon,
    children: [
      { to: "/users/profiles", label: "Profiles", icon: BuildingOffice2Icon },
      { to: "/users/buyer-gst", label: "Buyer GST", icon: DocumentTextIcon },
      {
        to: "/users/deletion-requests",
        label: "Deletion Requests",
        icon: DocumentTextIcon,
      },
    ],
  },
  { to: "/verification", label: "Verification", icon: ClipboardDocumentListIcon },
  { to: "/drivers", label: "Drivers", icon: TruckIcon },
  { to: "/admin", label: "Admins", icon: UserGroupIcon },
  { to: "/add-admin", label: "Add Admin", icon: UserPlusIcon },
  { to: "/banner", label: "Banner", icon: ArchiveBoxIcon },
  { to: "/warehouse", label: "Warehouse", icon: BuildingStorefrontIcon },
  { to: "/business-hours", label: "Business Hours", icon: ClockIcon },
  { to: "/app-configuration", label: "App Configuration", icon: Cog6ToothIcon },
  { to: "/policies", label: "Policies", icon: DocumentTextIcon },
  { to: "/legal-details", label: "Legal Details", icon: DocumentTextIcon },
  { to: "/notification", label: "notification", icon: BellAlertIcon },
  { to: "/walletDetails", label: "Wallet", icon: Wallet },
  {
    label: "Offers",
    icon: Gift,
    children: [{ to: "/offers/wallet", label: "Wallet Offers", icon: Wallet }],
  },
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

              if (item.children?.length) {
                return (
                  <div
                    key={item.label}
                    className="rounded-3xl bg-white/5 px-3 py-3"
                  >
                    <div className="flex items-center gap-4 px-1 pb-2 text-white/90">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </div>
                    <div className="space-y-2 pl-2">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={({ isActive }) =>
                              `flex items-center gap-4 px-4 py-3 rounded-full text-sm transition ${
                                isActive
                                  ? "bg-accent text-white"
                                  : "bg-white/10 hover:bg-white/20 text-white/80"
                              }`
                            }
                          >
                            <ChildIcon className="w-4 h-4" />
                            <span className="grow">{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                );
              }

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
