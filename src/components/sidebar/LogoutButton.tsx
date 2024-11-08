"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { CiLogout } from "react-icons/ci";

const LogoutButton = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-row space-x-4">
        <div
          className="w-8 h-8 rounded-full animate-spin
                    border-8 border-dashed border-blue-800 border-t-transparent"
        ></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <button onClick={()=> signIn()}  className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group">
        <CiLogout />
        <span className="group-hover:text-gray-700">Login</span>
      </button>
    );
  }

  return (
    <button onClick={()=> signOut()} className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group">
      <CiLogout />
      <span className="group-hover:text-gray-700">Logout</span>
    </button>
  );
};

export default LogoutButton;
