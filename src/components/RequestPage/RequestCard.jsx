import React from "react";
import Image from "next/image";
const RequestCard = ({ data }) => {
  console.log(data.image)
  const imageSrc = data?.image; // جلب الصورة من البيانات
  const isValidImage = imageSrc?.startsWith("http");
  const FILES_URL = process.env.NEXT_PUBLIC_FILES_URL
  return (
    <div className="bg-gray-50 shadow-sm rounded-lg p-3 sm:p-7">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-5 ">
          <p className="text-xl sm:text-2xl font-semibold text-gray-700 mb-5">
            Request #{data.public_id}
          </p>
         
        <a href={FILES_URL+imageSrc}>
        <Image
            src={FILES_URL+imageSrc} // البيانات.image
            width={1050}
            height={1050}
            alt="address image"
            className="w-[350px] h-[150px] object-cover rounded-sm"
          />
        </a>
   
        

        </div>
        <div
          className={`${
            data.status !== "processing" ? "bg-gray-500" : "bg-blue-500"
          } rounded-full text-sm sm:text-[16px] sm:px-4 px-2 py-1.5  sm:py-2.5 text-center shadow-md`}
        >
          <p className="text-white font-semibold">
            {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
