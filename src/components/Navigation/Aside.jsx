"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";

import Logo from "/public/logo/logo.svg";
import LogoutIcon from "/public/logo/logout.svg";
import SettingIcon from "/public/logo/setting.png";

import {
  FiChevronRight,
  FiMenu,
  FiX,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import { filteredMenuSections } from "./data"; // Updated import

const MenuItem = ({
  href,
  icon,
  label,
  subtitle,
  isActive,
  onClick,
  isOpen,
  toggleOpen,
  isCollapsed,
  isParentActive,
}) => (
  <li
    className={`flex items-center px-5 py-3 relative ${
      isActive || isParentActive ? "bg-[#de8945] rounded-md text-white" : ""
    }`}
    onClick={onClick}
  >
    {(isActive || isParentActive) && !isCollapsed && (
      <span className="absolute -left-5 top-0 h-full w-1 bg-[#de8945] rounded-r-md"></span>
    )}

    {subtitle ? (
      <div
        className="flex items-center w-full cursor-pointer"
        onClick={toggleOpen}
      >
        <Image
          src={icon}
          width={!isCollapsed ? 20 : 23}
          height={!isCollapsed ? 20 : 23}
          alt={label}
          className="mr-4"
        />
        {!isCollapsed && (
          <div className="flex items-center justify-between flex-1">
            {label}
            <span className="cursor-pointer">
              <FiChevronRight
                size={16}
                className={`transform transition-transform duration-300 ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
            </span>
          </div>
        )}
      </div>
    ) : (
      <Link href={href || ""} className="flex items-center w-full">
        <Image
          src={icon}
          width={!isCollapsed ? 20 : 23}
          height={!isCollapsed ? 20 : 23}
          alt={label}
          className="mr-4"
        />
        {!isCollapsed && <span>{label}</span>}
      </Link>
    )}
  </li>
);

const Aside = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [openSections, setOpenSections] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoadingVisible, setIsLoadingVisible] = useState(false);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLogout = () => {
    Cookies.remove("luxamToken");
    Cookies.remove("first_name");
    Cookies.remove("last_name");
    Cookies.remove("permissions");
    Cookies.remove("email");
    router.push("/");
  };

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkLoadingVisibility = () => {
      const loadingElement = document.querySelector("#loading");
      setIsLoadingVisible(!!loadingElement);
    };

    checkLoadingVisibility();
    const interval = setInterval(checkLoadingVisibility, 100);

    return () => clearInterval(interval);
  }, []);

  if (!isClient || pathname === "/" || isLoadingVisible) {
    return null;
  }

  return (
    <div className="relative select-none">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-[#de8945] text-white rounded-full shadow-lg"
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <AnimatePresence>
        {(isSidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 768)) && (
          <motion.aside
            className={`fixed md:sticky mt- inset-y-0 left-0 ${
              isCollapsed ? "w-[80px]" : "w-[300px]"
            } bg-[#fdf2eb] overflow-y-auto hide-scrollbar z-30 shadow-lg md:shadow-none tracking-tight h-screen md:duration-200`}
            initial={{ x: typeof window !== "undefined" && window.innerWidth >= 768 ? 0 : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-center mt-4">
              {!isCollapsed ? (
                <>
                  <Image
                    src={Logo}
                    alt="Logo"
                    width={110}
                    height={110}
                    className="transition-all duration-300"
                  />
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:block bg-[#de8945] absolute right-[10px] text-white rounded-full p-1 shadow-lg"
                  >
                    {isCollapsed ? <FiArrowRight size={18} /> : <FiArrowLeft size={20} />}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden md:block bg-[#de8945] text-white rounded-full p-1 shadow-lg mb-"
                >
                  {isCollapsed ? <FiArrowRight size={18} /> : <FiArrowLeft size={18} />}
                </button>
              )}
            </div>
            {!isCollapsed && <hr className="mt-3 mb-3 border-t border-gray-300" />}

            {/* Updated to use filteredMenuSections */}
            {filteredMenuSections.map(({ title, items }) => (
              <div key={title}>
                {!isCollapsed && (
                  <h1 className="px-6 mt-4 font-semibold text-[#17a3d7] text-lg">
                    {title}
                  </h1>
                )}
                <ul className={`mt-1 ${isCollapsed ? "px-2 mt-3" : "px-6"} mb-3`}>
                  {items.map(({ href, icon, label, subtitle }) => {
                    const isParentActive = subtitle?.some((subItem) => subItem.href === pathname);
                    return (
                      <React.Fragment key={label}>
                        <MenuItem
                          href={href}
                          icon={icon}
                          label={label}
                          subtitle={subtitle}
                          isActive={pathname === href}
                          isOpen={openSections[label]}
                          toggleOpen={() => toggleSection(label)}
                          isCollapsed={isCollapsed}
                          isParentActive={isParentActive}
                        />
                        <AnimatePresence>
                          {subtitle && openSections[label] && !isCollapsed && (
                            <motion.ul
                              className="ml-10 mt-1"
                              initial={{ opacity: 0, height: 0, y: -10 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -10 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              {subtitle.map((subItem) => (
                                <li key={subItem.href} className="mb-2.5">
                                  <Link
                                    href={subItem.href}
                                    className={`text-[15px] font-semibold ${
                                      subItem.href === pathname ? "text-[#de8945]" : "text-gray-600"
                                    }`}
                                  >
                                    {subItem.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </ul>
              </div>
            ))}


          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Aside;