"use client";
import React, { useState, useRef } from "react";
import { CldImage } from "next-cloudinary";
import { UsageLimitModal } from "@/components/UsageLimitModal";

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};

type SocialFormat = keyof typeof socialFormats;

export default function SocialMedia() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>(
    "Instagram Square (1:1)"
  );
  interface UsageInfo {
    canUse: boolean;
    currentCount: number;
    limit: number | string;
    remaining: number | string;
    subscriptionStatus: string;
  }

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
    const checkResponse = await fetch("/api/usage-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature: "social-media" }),
    });

    const usageStatus = await checkResponse.json();

    if (!usageStatus.canUse) {
      setUsageInfo(usageStatus);
      setShowLimitModal(true);
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("feature", "social-media");
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
        link.download = `${selectedFormat.replace(/\s+/g, "_")}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🎨 Social Media Image Creator
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
          <div className="mt-8">
            <label className="block text-gray-700 font-semibold mb-2">
              Choose Social Media Format
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 mb-6 text-gray-700 focus:ring-2 focus:ring-blue-400"
              value={selectedFormat}
              onChange={(e) =>
                setSelectedFormat(e.target.value as SocialFormat)
              }
            >
              {Object.keys(socialFormats).map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>

            {/* Preview Section */}
            <div className="relative flex justify-center bg-gray-100 rounded-lg overflow-hidden shadow-inner p-4">
              {isTransforming && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                  <span className="loading loading-spinner loading-lg text-blue-600"></span>
                </div>
              )}
              <CldImage
                width={socialFormats[selectedFormat].width}
                height={socialFormats[selectedFormat].height}
                src={uploadedImage}
                sizes="100vw"
                alt="transformed"
                crop="fill"
                gravity="auto"
                aspectRatio={socialFormats[selectedFormat].aspectRatio}
                ref={imageRef}
                className="rounded-lg shadow-md"
                onLoad={() => setIsTransforming(false)}
              />
            </div>

            {/* Download Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                Download for {selectedFormat}
              </button>
            </div>
          </div>
        )}
      </div>

      <UsageLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        feature="social media"
        currentCount={usageInfo?.currentCount || 0}
        limit={usageInfo?.limit || 5}
      />
    </div>
  );
}
