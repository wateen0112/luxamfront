"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import Loading from "../../../../../components/Loading";
import Link from "next/link";
import { FaTrash, FaPlus } from "react-icons/fa";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const CompanyDocumentsPage = () => {
  const { id } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = Cookies.get("luxamToken");
        const response = await axios.get(
          `${apiUrl}/company_documents_index/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDocuments(response.data.company_documents);
      } catch (err) {
        setError("Failed to load documents.");
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [id]);

  const handleDelete = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const token = Cookies.get("luxamToken");
      await axios.delete(`${apiUrl}/company_documents_delete/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDocuments(documents.filter((doc) => doc.id !== docId));
    } catch (error) {
      alert(error);
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 mt-6 mb-10">
      <div className="flex justify-between items-center mb-6 p-4 rounded-md">
        <h1 className="text-3xl font-semibold text-[#17a3d7] text-center">
          Company Documents
        </h1>
        <Link
          href={`/admin/companies/add-document/${id}`}
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#de8945] text-lg font-semibold rounded-lg hover:bg-gray-200 transition-all"
        >
          <FaPlus /> Add Document
        </Link>
      </div>
      <div className="bg-[#fdf2eb] p-4 rounded-lg shadow-md overflow-x-auto">
        {documents.length > 0 ? (
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="text-black border-b-2 border-gray-200">
                <th className="p-3 font-semibold">Label</th>
                <th className="p-3 font-semibold">Created At</th>
                <th className="p-3 font-semibold">Document</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b hover:bg-[#fde6d7] transition-all"
                >
                  <td className="p-4 text-gray-700">{doc.label}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(doc.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {doc.document.endsWith(".pdf") ? (
                      <Link
                        href={doc.document}
                        className="text-blue-500 underline hover:text-blue-700"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Document
                      </Link>
                    ) : (
                      <button
                        onClick={() => setSelectedImage(doc.document)}
                        className="text-blue-500 underline hover:text-blue-700"
                      >
                        View Document
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center">No documents available.</p>
        )}
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <img
              src={selectedImage}
              alt="Document"
              className="max-w-full max-h-[80vh] rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDocumentsPage;
