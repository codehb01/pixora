"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  Image,
  Settings,
  Info,
  Crop,
  SubscriptIcon,
  DollarSign,
} from "lucide-react";
import { IconSocial } from "@tabler/icons-react";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between"
    >
      {/* Brand */}
      <div>
        <Link href="/">
          <h2 className="text-2xl font-bold text-blue-600 mb-8">Pixora</h2>
        </Link>
        {/* Navigation */}
        <nav className="flex flex-col space-y-4">
          <Link
            href="/bg-removal"
            className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
          >
            <Image size={18} /> Background Removal
          </Link>

          <Link
            href="/smart-crop"
            className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
          >
            <Crop size={18} /> Smart Crop
          </Link>

          <Link
            href="/social-media"
            className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
          >
            <IconSocial size={18} /> Social Media
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
          >
            <DollarSign size={18} /> Pricing
          </Link>
        </nav>
      </div>
      <ClerkProvider>
        {/* Footer inside sidebar */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
          © {new Date().getFullYear()} Pixora
        </div>
      </ClerkProvider>
    </motion.aside>
  );
}
