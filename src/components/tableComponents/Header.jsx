import React, { useState } from "react";
import { AiOutlineSearch, AiOutlinePlus } from "react-icons/ai";
import Link from "next/link";

const Header = ({ link, exportFun, assign, handleDownload, setSearch, showAddButton = true }) => {
  const [searchValue, setSearchValue] = useState(""); // State to store the search input value

  const handleSearch = () => {
    if (setSearch) {
      setSearch(searchValue); // Call setSearch with the search value
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(); // Trigger search on "Enter" key press
    }
  };

  return (
    <div className="flex justify-center sm:justify-end items-center gap-4 mt-4 overflow-x-auto hide-scrollbar">
      {/* Search and Add Section */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Search Input */}
        <div className="relative w-full sm:w-auto">
          <AiOutlineSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
            size={20}
            onClick={handleSearch} // Trigger search on icon click
          />
          <input
            type="text"
            placeholder="Search"
            value={searchValue} // Bind input value to state
            onChange={(e) => setSearchValue(e.target.value)} // Update state on input change
            onKeyDown={handleKeyPress} // Handle "Enter" key press
            className="w-full sm:w-56 border pl-10 py-3.5 text-black bg-[#f9f9fa] border-gray-300 rounded-xl shadow-sm outline-none"
          />
        </div>

        {/* Conditionally render Add Button */}
        {showAddButton && (
          exportFun ? (
            <button
              onClick={handleDownload}
              className="gap-2 px-6 sm:px-20 w-full shadow-sm bg-[#de8945] border text-white py-3.5 rounded-xl hover:bg-[#d38e55] transition-all"
            >
              Export
            </button>
          ) : (
            <Link
              href={link}
              className={`gap-2 ${
                assign ? "px-6 sm:px-20" : "px-6 sm:px-20"
              } text-center  w-full shadow-sm bg-[#de8945] border text-white py-3.5 rounded-xl hover:bg-[#d38e55] transition-all whitespace-nowrap`}
            >
              {assign ? "Driver Assignment" : "Add"}
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default Header;