import React, { useEffect, useState } from "react";
import { fetchCategories, myProducts, createBanner } from "../../Api";
import toast from "react-hot-toast";

const AddBanner = ({ onBack, onBannerCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    actionType: "CATEGORY",
    actionId: "",
    targetUrl: "",
    description: "",
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [type, setType] = useState("CATEGORY");
  const [loading, setLoading] = useState(true);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      if (res?.ok) {
        const active = (res.categories || []).filter((c) => c.isActive);
        setCategories(active);

        if (active.length > 0) {
          setFormData((prev) => ({
            ...prev,
            actionId: active[0]._id,
          }));
        }
      }
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await myProducts();
      if (res?.ok) {
        setProducts(res.data?.products || []);
      }
    } catch {
      toast.error("Failed to load products");
    }
  };

  /* =========================
     IMAGE HANDLING
  ========================= */

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (selectedImageFiles.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const valid = [];

    files.forEach((file) => {
      if (!file.type.match("image.*")) return;
      if (file.size > 5 * 1024 * 1024) return;
      valid.push(file);
    });

    setSelectedImageFiles((prev) => [...prev, ...valid]);
    const previews = valid.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);

    e.target.value = "";
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* =========================
     TYPE CHANGE
  ========================= */

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);

    if (newType === "CATEGORY") {
      setFormData((prev) => ({
        ...prev,
        actionType: "CATEGORY",
        actionId: categories.length ? categories[0]._id : "",
      }));
    }

    if (newType === "PRODUCT") {
      setFormData((prev) => ({
        ...prev,
        actionType: "PRODUCT",
        actionId: products.length ? products[0]._id : "",
      }));
    }

    if (newType === "NONE") {
      setFormData((prev) => ({
        ...prev,
        actionType: "NONE",
        actionId: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Banner title required");
      return;
    }

    if (selectedImageFiles.length === 0) {
      toast.error("Select at least one image");
      return;
    }

    if (type === "CATEGORY" && !formData.actionId) {
      toast.error("Select a category");
      return;
    }

    if (type === "PRODUCT" && !formData.actionId) {
      toast.error("Select a product");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("actionType", type);

      if (type === "CATEGORY" || type === "PRODUCT") {
        formDataToSend.append("actionId", formData.actionId);
      }

      selectedImageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      if (formData.targetUrl.trim()) {
        formDataToSend.append("targetUrl", formData.targetUrl.trim());
      }

      if (formData.description.trim()) {
        formDataToSend.append("description", formData.description.trim());
      }

      const response = await createBanner(formDataToSend);

      if (response.ok) {
        toast.success("Banner created");

        imagePreviews.forEach((p) => URL.revokeObjectURL(p));

        setSelectedImageFiles([]);
        setImagePreviews([]);

        if (onBannerCreated) onBannerCreated(response.data?.banner);
        if (onBack) onBack();
      } else {
        toast.error(response.message || "Failed to create banner");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     RENDER SELECT
  ========================= */

  const renderActionSelect = () => {
    if (type === "CATEGORY") {
      return (
        <select
          name="actionId"
          value={formData.actionId}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      );
    }

    if (type === "PRODUCT") {
      return (
        <select
          name="actionId"
          value={formData.actionId}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name || p.title}
            </option>
          ))}
        </select>
      );
    }

    if (type === "NONE") {
      return (
        <p className="text-sm text-gray-500">
          Banner will not link to category or product
        </p>
      );
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Add Banner</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TITLE */}
        <input
          type="text"
          name="title"
          placeholder="Banner Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        {/* TYPE */}
        <select
          value={type}
          onChange={handleTypeChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="CATEGORY">Category</option>
          <option value="PRODUCT">Product</option>
          <option value="NONE">None</option>
        </select>

        {renderActionSelect()}

        {/* IMAGE */}
        <input type="file" multiple accept="image/*" onChange={handleImageChange} />

        {/* PREVIEW */}
        <div className="flex gap-2 flex-wrap">
          {imagePreviews.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt="" className="w-20 h-20 object-cover rounded" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0 right-0 bg-red-500 text-white px-1 rounded"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* TARGET URL */}
        <input
          type="url"
          name="targetUrl"
          placeholder="Target URL"
          value={formData.targetUrl}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        {/* DESCRIPTION */}
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isSubmitting ? "Creating..." : "Create Banner"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBanner;