import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ImageUpload({ onImageUploaded }) {
  const [uploading, setUploading] = useState(false);

  const uploadToIPFS = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
        },
        body: formData
      });

      const data = await response.json();
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
      onImageUploaded(imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      await uploadToIPFS(file);
    }
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">Campaign Image</span>
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="file-input file-input-bordered w-full"
      />
      {uploading && <span className="text-sm mt-2">Uploading...</span>}
    </div>
  );
}