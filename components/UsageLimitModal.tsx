"use client";
import React from "react";

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  currentCount: number;
  limit: number | string;
}

export function UsageLimitModal({
  isOpen,
  onClose,
  feature,
  currentCount,
  limit,
}: UsageLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Free Limit Reached
          </h2>
          <p className="text-gray-600 mb-6">
            You&apos;ve used {currentCount} out of {limit} free {feature}{" "}
            operations. Upgrade to Pro to continue using this feature unlimited
            times!
          </p>

          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = "/pricing")}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              🚀 Upgrade to Pro - $9/month
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
