import React from 'react'
import { NavLink } from 'react-router-dom'
import { UserIcon, CubeIcon, PlusIcon, ClipboardDocumentListIcon, CurrencyRupeeIcon, BuildingOffice2Icon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid'
import logo from "../assets/Logo.png"

const items = [
  { to:'/users', label:'Users', icon:UserIcon },
  { to:'/product', label:'Product', icon:CubeIcon },
  { to:'/add-product', label:'Add Product', icon:PlusIcon },
  { to:'/orders', label:'Orders', icon:ClipboardDocumentListIcon },
  // { to:'/transaction', label:'Transaction', icon:CurrencyRupeeIcon },
  { to:'/admin', label:'Admin', icon:Cog6ToothIcon },
  { to:'/add-admin', label:'Add Admin', icon:PlusIcon },
  { to:'/logout', label:'Logout', icon:ArrowRightOnRectangleIcon },
]

export default function Sidebar(){
  return (
    <aside className="w-64 bg-[#061D22] text-white h-screen p-6 flex flex-col justify-between ">
      <div>
        <div className="flex items-center gap-3 mb-8">
        <img src={logo} alt='logo' className='w-[37.13px] h-[37.13px]'/>
          <div className="font-semibold">Hungzo</div>
        </div>

        <nav className="space-y-3">
          {items.map(it=>{
            const Icon = it.icon
            return (
              <NavLink key={it.to} to={it.to} className={({isActive})=>`flex items-center gap-3 px-4 py-3 rounded-full text-sm ${isActive ? 'bg-accent text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'}`}>
                <Icon className="w-5 h-5" />
                <span className="grow">{it.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="text-center mb-4">
        {/* <div className="w-16 h-16 rounded-full mx-auto bg-amber-400 flex items-center justify-center">👣</div> */}
        <img src={logo} alt=""  className='w-16 h-16 rounded-full mx-auto flex items-center justify-center'/>
        <div className="mt-2 text-xs text-white/60">©2025 admin panel</div>
      </div>
    </aside>
  )
}
