import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navigation/Navbar";
import Aside from "@/components/Navigation/Aside";
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
            <NotificationProvider>{children}</NotificationProvider>
          </div>
        </main>
      </body>
    </html>
  );
}
