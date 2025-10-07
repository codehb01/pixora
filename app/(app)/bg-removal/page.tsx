"use client";
import React, { useState } from "react";
import { CldImage } from "next-cloudinary";
import { UsageLimitModal } from "@/components/UsageLimitModal";

export default function BgRemoval() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  interface UsageInfo {
    canUse: boolean;
    currentCount: number;
    limit: number | string;
    remaining: number | string;
    subscriptionStatus: string;
  }

  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Check usage limit first
    try {
      const checkResponse = await fetch("/api/usage-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature: "bg-removal" }),
      });

      // Handle non-JSON responses
      const contentType = checkResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Please ensure you're signed in."
        );
      }

      const usageStatus = await checkResponse.json();

      if (!usageStatus.canUse) {
        setUsageInfo(usageStatus);
        setShowLimitModal(true);
        setIsUploading(false);
        return;
      }

      // Proceed with upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("feature", "bg-removal");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.status === 403) {
        const errorData = await response.json();
        setUsageInfo(errorData.usageStatus);
        setShowLimitModal(true);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      setUploadedImage(data.publicId);
      setUploadedUrl(data.secureUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!uploadedUrl) return;

    fetch(uploadedUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `bg-removed.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          🪄 AI Background Remover
        </h1>

        <div className="space-y-4">
          <label className="block text-gray-600 font-medium">
            Upload an image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="file-input file-input-bordered file-input-primary w-full"
          />

          {isUploading && (
            <div className="mt-4 text-center">
              <div className="loading loading-spinner loading-lg"></div>
              <p className="mt-2">Uploading and removing background...</p>
            </div>
          )}

          {uploadedImage && (
            <div className="mt-8">
              <div className="flex justify-center mb-4">
                <CldImage
                  src={uploadedImage}
                  alt="Background removed"
                  width={500}
                  height={500}
                  removeBackground
                  className="rounded-lg shadow-md"
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Download Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <UsageLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        feature="background removal"
        currentCount={usageInfo?.currentCount || 0}
        limit={usageInfo?.limit || 5}
      />
    </div>
  );
}
