import React from "react";
import Image from "next/image";

const Form = ({ fields, formName, layout, data }) => {
  return (
    <form name={formName} className={`${layout} w-full gap-2 sm:gap-5 mt-10`}>
      {fields.map(({ name, label }, index) => (
        <InputField
          key={index}
          name={name}
          label={label}
          value={data[name] || ""}
        />
      ))}
    </form>
  );
};

const InputField = ({ name, label, value }) => (
  <div className="">
    <label className="block font-medium text-gray-600">{label}</label>
    <input
      name={name}
      readOnly
      type="text"
      value={value || ""}
      className="mt-1 w-full px-4 py-2 border rounded-md outline-none"
    />
  </div>
);

const AddressCard = ({ data }) => {
  const imageSrc = data?.image; // جلب الصورة من البيانات
  const isValidImage = imageSrc?.startsWith("http");

  const addressFields = [
    { name: "city", label: "City" },
    { name: "address", label: "Address" },
    { name: "street", label: "Street" },
    { name: "building_name", label: "Building name" },
    { name: "flat_no", label: "Flat no." },
  ];
  return (
    <div className="bg-gray-50 shadow-sm rounded-lg p-3 sm:p-7 mt-10">
      <p className="text-xl sm:text-2xl font-semibold text-gray-700">
        Address Details
      </p>
      <div className="flex flex-col justify-center items-center mt-5">
        {isValidImage ? (
          <Image
            src={imageSrc} // البيانات.image
            width={1050}
            height={1050}
            alt="address image"
            className="w-[350px] h-[150px] object-cover rounded-sm"
          />
        ) : (
          <div className="w-[350px] h-[150px] bg-gray-300 rounded-sm flex justify-center items-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
        <Form
          fields={addressFields}
          formName="addressForm"
          layout="grid grid-cols-2"
          data={data} // تمرير البيانات إلى النموذج
        />
      </div>
    </div>
  );
};

export default AddressCard;
