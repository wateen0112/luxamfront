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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // تأكد من أن الرابط في .env مضبوط بشكل صحيح
  const router = useRouter();
  // دالة إرسال البيانات
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // إعادة تعيين الخطأ عند محاولة جديدة

    try {
      // إرسال البيانات إلى الواجهة الخلفية
      const response = await axios.post(`${apiUrl}/dashboard/login`, {
        email,
        password,
      });
      console.log(response)

      if (response.data.access_token) {
        // تخزين التوكين في الـ cookie
        Cookies.set("luxamToken", response.data.access_token);

        // إعادة توجيه المستخدم إلى الصفحة الرئيسية أو أي مكان آخر
        router.push("/admin/dashboard"); // قم بتغيير هذا حسب الحاجة
      }
    } catch (err) {
      setError("فشل تسجيل الدخول. تأكد من صحة البيانات.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pattern">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <Image src={Logo} alt="Company Logo" width={125} height={125} />
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6 mb-1">
          {/* Email Input */}
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

          {/* Password Input */}
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

          {/* Error Message */}
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {/* Submit Button */}
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
