import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { UserIcon, CubeIcon, PlusIcon, ClipboardDocumentListIcon, CurrencyRupeeIcon, BuildingOffice2Icon, Cog6ToothIcon, ArrowRightOnRectangleIcon, BellAlertIcon } from '@heroicons/react/24/solid'
import logo from "../assets/Logo.png"

const items = [
  { to: '/restaurants', label: 'Restaurants', icon: BuildingOffice2Icon },
  { to: '/verification', label: 'Verification', icon: ClipboardDocumentListIcon },
  { to: '/restaurant-details', label: 'Details', icon: UserIcon },
  { to: '/suppliers', label: 'Suppliers', icon: CubeIcon },
  { to: '/inventory', label: 'Inventory', icon: PlusIcon },
  { to: '/orders', label: 'Orders', icon: ClipboardDocumentListIcon },
  { to: '/drivers', label: 'Drivers', icon: UserIcon },
  { to: '/logout', label: 'Logout', icon: ArrowRightOnRectangleIcon },
];


export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#061D22] text-white h-screen p-6 flex flex-col justify-between ">
      <div>
        <Link to={'/'}>
        <div className="flex items-center gap-3 mb-5">
          <img src={logo} alt='logo' className='w-[37.13px] h-[37.13px]' />
          <div className="font-semibold">Hungzo</div>
        </div>
        </Link>

        <nav className="space-y-3">
          {items.map(it => {
            const Icon = it.icon
            return (
              <NavLink key={it.to} to={it.to} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-full text-sm ${isActive ? 'bg-accent text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'}`}>
                <Icon className="w-5 h-5" />
                <span className="grow">{it.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="text-center mb-4 flex flex-col items-center">
        <img src={logo} alt="" />
        <div className="mt-2 text-xs text-white/60">©2025 admin panel</div>
      </div>
    </aside>
  )
}
