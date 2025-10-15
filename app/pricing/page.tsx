"use client";

import React from "react";
import { Header } from "@/components/Header";
import { PricingTableOne } from "@/components/billingsdk/pricing-table-one";
import { plans } from "@/lib/billingsdk-config";
const page = () => {
  return (
    <div>
      <Header />

      <PricingTableOne
        plans={plans}
        title="Pricing"
        description="Choose the plan that's right for you"
        onPlanSelect={(planId) => console.log("Selected plan:", planId)}
        size="medium" // small, medium, large
        theme="classic" // minimal or classic
        className="w-full"
      />
    </div>
  );
};

export default page;
