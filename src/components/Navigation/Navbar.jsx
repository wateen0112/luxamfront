"use client";
import React, { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingVisible, setIsLoadingVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = React.useRef(null); // Ref for the dropdown area

  // Handle logout function
  const handleLogout = () => {
    Cookies.remove("luxamToken");
    Cookies.remove("first_name");
    Cookies.remove("last_name");
    Cookies.remove("permissions");
    Cookies.remove("email");
    router.push("/");
  };

  useEffect(() => {
    setIsClient(true);

    // Check if loading element exists in DOM
    const checkLoadingVisibility = () => {
      const loadingElement = document.querySelector("#loading");
      setIsLoadingVisible(!!loadingElement);
    };

    // Check loading state on mount
    checkLoadingVisibility();

    // Continuously monitor DOM for loading element
    const interval = setInterval(checkLoadingVisibility, 100);

    // Add click listener to close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval); // Cleanup interval
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup event listener
    };
  }, []);

  if (!isClient || pathname === "/" || isLoadingVisible) {
    return null; // Hide navbar on homepage or during loading
  }
 const first_name = Cookies.get('first_name')
 const last_name = Cookies.get('last_name')
 const email = Cookies.get('email')
  return (
    <nav className="bg-[#fafafa] py-4 w-full sticky top-0 left-0 z-20">
      <div className="flex justify-end md:px-14 px-4 items-center">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <FaUserCircle size={40} className="text-gray-600" />
     {first_name!==null&&first_name!=='null' &&last_name!==null&&last_name!=='null'&&
      <span className="font-semibold text-gray-800">{first_name??'' } {last_name??''}</span>
     }
            <FiChevronDown className="text-gray-600" />
          </button>

          {/* Dropdown/Popup for user info and logout */}
          {isOpen && (
            <div
              className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col py-3 px-4 hover:bg-gray-100 transition">
            
           {first_name!==null&&first_name!=='null' &&last_name!==null&&last_name!=='null'&&
                <h1 className="font-semibold text-gray-800">{first_name } {last_name} </h1>
            }
               {
                email&&  <p className="text-sm text-gray-600">{email}</p>
               }
              </div>
              <div
                className="flex justify-center border-t py-2 mb-2 cursor-pointer hover:bg-gray-100 transition"
                onClick={handleLogout}
              >
                <button className="text-sm">Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;