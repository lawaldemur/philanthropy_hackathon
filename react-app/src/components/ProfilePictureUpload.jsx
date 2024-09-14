import React, { useState } from 'react';
import axios from 'axios';

function ProfilePictureUpload({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/upload_profile_picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = response.data.image_url;
      onUpload(imageUrl);
    } catch (error) {
      console.log('Error uploading image:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Upload
      </button>
    </div>
  );
}

export default ProfilePictureUpload;