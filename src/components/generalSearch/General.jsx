import { useState } from "react";
import { FaSearch } from "react-icons/fa";

const SelectField = ({
  label,
  placeholder,
  icon: Icon,
  options,
  name,
  setSelected,
  openDropdown,
  setOpenDropdown,
  isSearchTotalVerifiedCollection,
}) => {
  const [selectedOption, setSelectedOption] = useState("");
  const isOpen = openDropdown === label;
  const isDateField = [
    "collected_date",
    "collection_start_date",
    "collection_end_date",
   
    "verified_start_date",
    "verified_end_date",
  ].includes(name);

  const toggleDropdown = () => {
    setOpenDropdown(isOpen ? null : label);
  };

  const handleSelect = (option) => {
    setSelectedOption(option.value);
    setOpenDropdown(null);
    setSelected((prev) => ({
      ...prev,
      [name]: {
        id: option.id ?? null,
        value: option.value,
      },
    }));
  };

  return (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <div className="relative">
        {isDateField ? (
          <input
            type="date"
            className="w-full pl-6 pr-4 py-2.5 bg-slate-50 text-gray-600 cursor-pointer text-sm"
            value={selectedOption}
            onChange={(e) => {
              setSelectedOption(e.target.value);
              setSelected((prev) => ({
                ...prev,
                [name]: { value: e.target.value },
              }));
            }}
          />
        ) : (
          <div
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 text-gray-600 cursor-pointer"
            onClick={toggleDropdown}
          >
            <span className="font-semibold text-sm text-gray-500/85 whitespace-nowrap">
              {selectedOption || placeholder}
            </span>
            <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          </div>
        )}
        {!isDateField && isOpen && (
          <ul
            className={`absolute w-full bg-gray-100 text-slate-700 rounded-lg shadow-md z-50 max-h-[200px] overflow-y-auto hide-scrollbar ${
              isSearchTotalVerifiedCollection
                ? "bottom-full mt-0"
                : "top-full mt-1"
            }`}
          >
            {options.map((option, index) => (
              <li
                key={index}
                className="py-2 px-4 hover:bg-slate-300/60 cursor-pointer transition-all rounded-lg"
                onClick={() => handleSelect(option)}
              >
                {option.value}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const General = ({
  title,
  inputs,
  setSelected,
  handleSubmitSectionOne,
  handleSubmitSectionTwo,
  handleSubmitSectionThree,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const isSearchTotalVerifiedCollection =
    title === "Search Total Verified Collection";

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-10">
        <p className="lg:text-3xl text-lg sm:text-2xl font-semibold text-[#17a3d7]">
          {title}
        </p>
        <button
          onClick={
            handleSubmitSectionOne ||
            handleSubmitSectionTwo ||
            handleSubmitSectionThree
          }
          className="flex items-center gap-3 lg:text-lg px-6 sm:px-24 lg:px-32 py-2 rounded-lg bg-[#de8945] text-white font-semibold hover:bg-[#de8945]/90 transition-all"
        >
          <FaSearch className="text-white" />
          Search
        </button>
      </div>

      <form className="grid xl:grid-cols-4 lg:grid-cols-2 grid-cols-1 md:gap-x-3 lg:gap-x-5 xl:gap-x-4 gap-y-7">
        {inputs.map(({ label, placeholder, icon, options, name }, index) => (
          <SelectField
            key={index}
            label={label}
            placeholder={placeholder}
            icon={icon}
            options={options}
            title={title}
            setSelected={setSelected}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            name={name}
            isSearchTotalVerifiedCollection={isSearchTotalVerifiedCollection}
          />
        ))}
      </form>
    </div>
  );
};

export default General;
