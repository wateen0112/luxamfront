import React from "react";
import storeIcon from "/public/images/store.svg";
import Image from "next/image";
// بيانات المخازن
const stores = [
  {
    count: 40,
    rows: [
      { label: "Full", value: "25,000 IG", bg: "#9bb37c" },
      { label: "Filled", value: "25,000 IG", bg: "#f9bb32" },
      { label: "DL", value: "25,000 IG", bg: "#ff6666" },
    ],
  },
  {
    count: 68,
    rows: [
      { label: "Full", value: "25,000 IG", bg: "#9bb37c" },
      { label: "Filled", value: "25,000 IG", bg: "#f9bb32" },
      { label: "DL", value: "25,000 IG", bg: "#ff6666" },
    ],
  },
  {
    count: 72,
    rows: [
      { label: "Full", value: "25,000 IG", bg: "#9bb37c" },
      { label: "Filled", value: "25,000 IG", bg: "#f9bb32" },
      { label: "DL", value: "25,000 IG", bg: "#ff6666" },
    ],
  },
];

const StoreCardComponent = ({ count, rows }) => (
  <div className="relative w-[160px] flex items-center">
    <Image
      className="w-[160px]"
      src={storeIcon}
      width={160}
      height={120}
      alt="store"
    />
    <p className="absolute left-[44px] top-[67px] text-white font-semibold text-[9px]">
      {count}
    </p>
    <div className="text-xs">
      <table className="min-w-[160px] border-collapse">
        <tbody>
          {rows.map((row, index) => (
            <tr className="border" key={index}>
              <td className="px-4 py-1 font-semibold text-center bg-[#c9b18b]">
                {row.label}
              </td>
              <td
                className="py-1.5 border text-center font-semibold"
                style={{ backgroundColor: row.bg }}
              >
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const StoreCard = () => {
  return (
    <>
      {stores.map((store, index) => (
        <StoreCardComponent key={index} count={store.count} rows={store.rows} />
      ))}
    </>
  );
};

export default StoreCard;
