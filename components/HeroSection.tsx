"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
      {/* Decorative gradient borders */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>

      <div className="px-4 py-10 md:py-20 text-center">
        {/* Main headline animation */}
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-3xl font-bold text-slate-800 md:text-5xl lg:text-7xl dark:text-slate-200">
          {"Transform Your Media with AI — Instantly, Intelligently, Effortlessly."
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="relative z-10 mx-auto max-w-2xl py-6 text-lg font-normal text-neutral-700 dark:text-neutral-400"
        >
          <strong>Pixora</strong> is your AI-powered media assistant — remove
          backgrounds, enhance images, generate smart social previews, and
          optimize content delivery with Cloudinary. Build smarter, faster, and
          cleaner visual experiences for the web.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button className="w-54 transform rounded-lg bg-blue-600 px-6 py-3 cursor-pointer  font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700">
            Get Started with Pixora
          </button>
          <button className="w-52 transform rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900 cursor-pointer">
            Learn More
          </button>
        </motion.div>

        {/* Product preview mockup */}
      </div>
    </div>
  );
}
