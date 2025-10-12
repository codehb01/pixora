"use client";
import React, { useState, useRef } from "react";
import { CldImage } from "next-cloudinary";
import { UsageLimitModal } from "@/components/UsageLimitModal";

interface UsageInfo {
  canUse: boolean;
  currentCount: number;
  limit: number | string;
  remaining: number | string;
  subscriptionStatus: string;
}

export default function SmartCrop() {
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [aspect, setAspect] = useState("1:1");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const checkResponse = await fetch("/api/usage-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature: "smart-crop" }),
      });

      const usageStatus = await checkResponse.json();

      if (!usageStatus.canUse) {
        setUsageInfo(usageStatus);
        setShowLimitModal(true);
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("feature", "smart-crop");

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

      const data = await response.json();
      setUploadedImage(data.publicId);
    } catch (error) {
      console.error(error);
      alert("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!imageRef.current) return;

    fetch(imageRef.current.src)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `cropped.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          ✂️ Smart Crop Tool
        </h1>

        {/* Upload Section */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Upload an Image
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
          {isUploading && (
            <div className="w-full mt-3">
              <div className="h-2 bg-blue-100 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full w-3/4 animate-pulse"></div>
              </div>
              <p className="text-sm text-blue-500 mt-2 text-center">
                Uploading...
              </p>
            </div>
          )}
        </div>

        {/* Image Transform Section */}
        {uploadedImage && (
          <div className="mt-6">
            {/* Preview Section */}
            <div className="flex gap-2 mt-4 justify-center">
              <button
                onClick={() => setAspect("1:1")}
                className="px-3 py-1 border rounded hover:bg-blue-100"
              >
                Square
              </button>
              <button
                onClick={() => setAspect("16:9")}
                className="px-3 py-1 border rounded hover:bg-blue-100"
              >
                Wide
              </button>
              <button
                onClick={() => setAspect("4:5")}
                className="px-3 py-1 border rounded hover:bg-blue-100"
              >
                Portrait
              </button>
            </div>

            <div className="relative flex justify-center bg-gray-100 rounded-lg overflow-hidden shadow-inner p-4 mt-4">
              {isTransforming && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                  <span className="loading loading-spinner loading-lg text-blue-600"></span>
                </div>
              )}
              <CldImage
                width="400"
                height="400"
                src={uploadedImage}
                sizes="100vw"
                alt="Smart Cropped Image"
                crop="fill"
                gravity="auto"
                aspectRatio={aspect}
                ref={imageRef}
                className="rounded-lg shadow-md"
                onLoad={() => setIsTransforming(false)}
              />
            </div>
          </div>
        )}

        {/* Download Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Download
          </button>
        </div>
      </div>

      <UsageLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        feature="smart crop"
        currentCount={usageInfo?.currentCount || 0}
        limit={usageInfo?.limit || 5}
      />
    </div>
  );
}
