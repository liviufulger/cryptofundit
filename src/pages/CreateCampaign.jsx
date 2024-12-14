import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { toast } from "react-hot-toast";
import ImageUpload from "../components/ImageUpload";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  convertToUnixTimestamp,
  convertToAVAX,
  getMinDate,
} from "../utils/helpers";
import { validateCampaignForm } from "../utils/validation";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { contract, account } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    deadline: "",
    image: "",
  });
  const [useImageUrl, setUseImageUrl] = useState(false); // Toggle for image upload option
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUploaded = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
    if (errors.image) {
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    const validationErrors = validateCampaignForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const { title, description, target, deadline, image } = formData;

      const tx = await contract.createCampaign(
        title,
        description,
        convertToAVAX(target),
        convertToUnixTimestamp(deadline),
        image
      );

      const toastId = toast.loading("Creating your campaign...");
      await tx.wait();

      toast.success("Campaign created successfully!", {
        id: toastId,
      });
      navigate("/my-campaigns");
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Create Campaign
          </h1>

          {!account ? (
            <div className="alert alert-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Please connect your wallet to create a campaign</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Campaign Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a catchy title for your campaign"
                  className={`input input-bordered w-full ${
                    errors.title ? "input-error" : ""
                  }`}
                />
                {errors.title && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.title}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your campaign and its goals"
                  className={`textarea textarea-bordered h-32 ${
                    errors.description ? "textarea-error" : ""
                  }`}
                />
                {errors.description && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.description}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Target Amount (AVAX)
                  </span>
                </label>
                <input
                  type="number"
                  name="target"
                  value={formData.target}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  placeholder="How much AVAX do you want to raise?"
                  className={`input input-bordered w-full ${
                    errors.target ? "input-error" : ""
                  }`}
                />
                {errors.target && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.target}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">End Date</span>
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={getMinDate()}
                  className={`input input-bordered w-full ${
                    errors.deadline ? "input-error" : ""
                  }`}
                />
                {errors.deadline && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.deadline}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <div className="flex items-center mb-4">
                  <label className="label cursor-pointer">
                    <span className="label-text font-medium mr-4">
                      Use Image URL
                    </span>
                    <input
                      type="checkbox"
                      className="toggle"
                      checked={useImageUrl}
                      onChange={() => setUseImageUrl((prev) => !prev)}
                    />
                  </label>
                </div>

                {useImageUrl ? (
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="Enter the image URL"
                    className={`input input-bordered w-full ${
                      errors.image ? "input-error" : ""
                    }`}
                  />
                ) : (
                  <ImageUpload onImageUploaded={handleImageUploaded} />
                )}
                {errors.image && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.image}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control mt-8">
                <button
                  type="submit"
                  disabled={loading || !account}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Creating Campaign...</span>
                    </>
                  ) : (
                    "Create Campaign"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
