import Image from "next/image";
import Link from "next/link";
import React from "react";
import SidebarItem from "./SidebarItem";
import {  IoBasketOutline, IoCalendarOutline, IoCheckboxOutline, IoCodeWorkingOutline, IoListOutline,  IoPersonOutline } from "react-icons/io5";
import { CiLogout } from "react-icons/ci";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LogoutButton from "./LogoutButton";

const menuItems = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: <IoCalendarOutline size={30} />,
  },
  {
    path: "/dashboard/rest-todos",
    title: "Rest TODOS",
    icon: <IoCheckboxOutline size={30} />,
  },
  {
    path: "/dashboard/server-todos",
    title: "Server Actions",
    icon: <IoListOutline size={30} />,
  },
  {
    path: "/dashboard/cookies",
    title: "Cookies",
    icon: <IoCodeWorkingOutline size={30} />,
  },
  {
    path: "/dashboard/products",
    title: "Productos",
    icon: <IoBasketOutline size={30} />,
  },
  {
    path: "/dashboard/profile",
    title: "Profile",
    icon: <IoPersonOutline size={30} />,
  },
];

const Sidebar = async () => {

  // tomamos la info del usuario 
  const session = await getServerSession(authOptions);

  const userName = session?.user?.name ?? 'no name';
  const avatarUrl = (session?.user?.image )
  ? session?.user?.image
  : 'https://res.cloudinary.com/dtbfspso5/image/upload/v1699289203/312014016_851542552876625_5393500657488779832_n_nomgxm.jpg'

  // TODO: const userRole : session?.user?.name ?? 'no name';


  return (
    <aside className="ml-[-100%] fixed z-10 top-0 pb-3 px-6 w-full flex flex-col justify-between h-screen border-r bg-white transition duration-300 md:w-4/12 lg:ml-0 lg:w-[25%] xl:w-[20%] 2xl:w-[15%]">
      <div>
        <div className="-mx-6 px-6 py-4">
          <Link href="/dashboard" title="home">
            <Image
              src="https://tailus.io/sources/blocks/stats-cards/preview/images/logo.svg"
              width={150}
              height={150}
              alt="tailus logo"
            />
          </Link>
        </div>
        <div className="mt-8 text-center">
          <Image
            src={avatarUrl}
            width={150}
            height={150}
            className="w-10 h-10 m-auto rounded-full object-cover lg:w-28 lg:h-28"
            alt="perfil"
          />
          <h5 className="hidden mt-4 text-xl font-semibold text-gray-600 lg:block">
            {userName}
          </h5>
          <span className="hidden text-gray-400 lg:block">Admin</span>
        </div>
        <ul className="space-y-2 tracking-wide mt-8">
          {menuItems.map((item) => (
            <SidebarItem key={item.path} {...item} />
          ))}
        </ul>
      </div>

      <div className="px-6 -mx-6 pt-4 flex justify-between items-center border-t">
          <LogoutButton />
      </div>
    </aside>
  );
};

export default Sidebar;
