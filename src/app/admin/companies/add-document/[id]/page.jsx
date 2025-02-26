"use client";
import React, { useState, useRef } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { useNotification } from "../../../../../components/notifi/NotificationContext";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const AddDocument = () => {
  const triggerNotification = useNotification();
  const router = useRouter();
  const { id } = useParams();
  const [label, setLabel] = useState("");
  const [documents, setDocuments] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setDocuments(Array.from(e.target.files));
  };
  const handleLabelChange = (e) => {
    setLabel(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("labels[]", label);
    documents.forEach((document) => {
      formData.append("documents[]", document);
    });

    const token = Cookies.get("luxamToken");
    try {
      const response = await axios.post(
        `${apiUrl}/company_documents_store/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      triggerNotification("Documents added successfully", "success");

      setLabel("");
      setDocuments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while adding documents");
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center h-screen p-6">
      <div className="min-w-[50%]">
        <h1 className="text-2xl font-semibold mb-6 text-[#17a3d7] text-start">
          Add Documents for the Company
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6 ">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Label
            </label>
            <div className="flex space-x-4 items-center">
              <input
                type="text"
                value={label}
                onChange={handleLabelChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Enter label here"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Documents
            </label>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#de8945] text-white rounded-md hover:bg-[#de8945]/90 transition-all"
            >
              Add Documents
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDocument;
