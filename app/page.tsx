import { HeroSection } from "@/components/HeroSection";
import { Header } from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";

import React from "react";

const page = () => {
  return (
    <ClerkProvider>
      <div>
        <Header />
        <HeroSection />
      </div>
    </ClerkProvider>
  );
};

export default page;
