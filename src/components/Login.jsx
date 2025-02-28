"use client";
import React, { useState } from "react";
import Logo from "/public/logo/logo.svg";
import Image from "next/image";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${apiUrl}/dashboard/login`, {
        email,
        password,
      });

      if (response.data.access_token) {
        // Store the token in cookies
        Cookies.set("luxamToken", response.data.access_token);
        Cookies.set("userPermissions", response.data.permissions);
        Cookies.set("first_name", response.data.first_name);
        Cookies.set("last_name", response.data.last_name);
        Cookies.set("email", response.data.email);

        // Store the permissions in localStorage
        // localStorage.setItem("userPermissions", JSON.stringify(response.data.permissions));

        // Redirect to the dashboard
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("فشل تسجيل الدخول. تأكد من صحة البيانات.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pattern">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-center mb-5">
          <Image src={Logo} alt="Company Logo" width={125} height={125} />
        </div>

        <form onSubmit={handleLogin} className="space-y-6 mb-1">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#de8945]"
              placeholder="Enter Your Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#de8945]"
              placeholder="Enter Your Password"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#de8945] text-white font-semibold rounded-lg shadow-md hover:bg-[#de8945]/85 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;