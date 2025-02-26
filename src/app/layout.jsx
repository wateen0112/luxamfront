import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Aside from "@/components/Navigation/Aside";
import Navbar from "@/components/Navigation/Navbar";
import { ToastContainer } from "react-toastify";
import { NotificationProvider } from "@/components/notifi/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LBF",
  description:
    "A control panel to manage Luxam and display its data and statistics",
  icons: {
    icon: "/logo/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="flex">
          <Aside />
          <div className="w-full ">
            <Navbar />
            <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
            <NotificationProvider>{children}</NotificationProvider>
          </div>
        </main>
      </body>
    </html>
  );
}
