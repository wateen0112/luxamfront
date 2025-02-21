"use client";
import React, { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingVisible, setIsLoadingVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);

    // تحقق من وجود عنصر التحميل في DOM
    const checkLoadingVisibility = () => {
      const loadingElement = document.querySelector("#loading");
      setIsLoadingVisible(!!loadingElement);
    };

    // تحقق من حالة التحميل عند التحميل
    checkLoadingVisibility();

    // تابع تغير حالة DOM بشكل مستمر إذا كان loading موجود
    const interval = setInterval(checkLoadingVisibility, 100);

    return () => clearInterval(interval); // تنظيف التابع عند فك التعلق
  }, []);

  if (!isClient || pathname === "/" || isLoadingVisible) {
    return null; // إخفاء الشريط الجانبي إذا كانت الصفحة الرئيسية أو في حالة التحميل
  }

  return (
    <nav className="bg-[#fafafa] py-4 w-full sticky top-0 left-0 z-20">
      <div className="flex justify-end md:px-14 px-4 items-center">
        <div className="flex items-center gap-2">
          <FaUserCircle size={40} className="text-gray-600" />
          <div className="flex flex-col">
            <h1 className="font-semibold text-gray-800">Admin</h1>
          </div>
        </div>

        <div className="relative ml-5">
          <div
            className={`absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg transition-all duration-300 ${
              isOpen
                ? "opacity-100 transform scale-100"
                : "opacity-0 transform scale-95 pointer-events-none"
            }`}
          >
            <div className="flex flex-col py-3 px-4 hover:bg-gray-100 transition">
              <h1 className="font-semibold text-gray-800">Hassan Aljeshi</h1>
              <p className="text-sm text-gray-600">Admin@luxam.com</p>
            </div>
            <div className="flex justify-center border-t py-2 mb-2 cursor-pointer hover:bg-gray-100 transition">
              <button className="text-sm">Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
