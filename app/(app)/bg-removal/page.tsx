"use client";
import React, { useState, useRef } from "react";
import { CldImage } from "next-cloudinary";

export default function SocialMedia() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/background-remove", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");
      const data = await response.json();
      setUploadedImage(data.publicId);
    } catch (error) {
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!imageRef.current) return;
    fetch(imageRef.current.src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "background-removed.png";
        link.click();
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
            onChange={handleFileUpload}
            className="file-input file-input-bordered file-input-primary w-full"
          />

          {isUploading && (
            <div className="mt-4">
              <progress className="progress progress-primary w-full"></progress>
              <p className="text-center text-sm text-gray-500 mt-2">
                Uploading...
              </p>
            </div>
          )}

          {uploadedImage && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Preview
              </h3>
              <div className="relative flex justify-center items-center bg-gray-50 border rounded-xl p-4 shadow-inner">
                {isTransforming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10 rounded-xl">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                )}

                <CldImage
                  src={uploadedImage}
                  sizes="100vw"
                  alt="Background Removed"
                  crop="fill"
                  gravity="auto"
                  ref={imageRef}
                  className="rounded-lg shadow-md"
                  onLoad={() => setIsTransforming(false)}
                  width="500"
                  height="500"
                  removeBackground
                  tint="70:blue:purple"
                  // underlay="<Public ID>"
                />
              </div>

              <div className="flex justify-end mt-6">
                <button
                  className="btn btn-primary px-6 py-2 text-white rounded-lg hover:bg-blue-600 transition"
                  onClick={handleDownload}
                >
                  Download Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
