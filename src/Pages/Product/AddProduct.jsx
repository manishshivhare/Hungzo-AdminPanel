import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgePlus, ArrowDownRight } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchCategories,
  addCategory,
  createProduct,
} from "../../Api";

export default function AddProductPage() {
  const navigate = useNavigate();

  /* ================= CATEGORY ================= */
  const [categories, setCategories] = useState([]);
  const [addcategories, setAddCategories] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const loadCategories = async () => {
    const res = await fetchCategories();
    if (res.ok) setCategories(res.categories);
    else toast.error(res.message);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    name: "",
    category: "",
    status: "available",
    description: "",
  });

  const [varieties, setVarieties] = useState([
    { name: "", price: "" },
    { name: "", price: "" },
    { name: "", price: "" },
  ]);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const maxDesc = 500;

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVarietyChange = (i, field, value) => {
    const updated = [...varieties];
    updated[i][field] = value;
    setVarieties(updated);
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages(mapped);
  };

  const removeImage = (i) => {
    setImages((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[i].url);
      copy.splice(i, 1);
      return copy;
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim())
      return setMessage({ type: "error", text: "Product name required" });

    if (!form.category)
      return setMessage({ type: "error", text: "Category required" });

    if (images.length === 0)
      return setMessage({ type: "error", text: "Upload at least one image" });

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("status", form.status);
      formData.append("descriptions", form.description);

      // ✅ FIX: send varieties as JSON
      const validVarieties = varieties.filter(
        (v) => v.name.trim() && v.price
      );
      formData.append("varieties", JSON.stringify(validVarieties));

      // images
      images.forEach((img) => formData.append("images", img.file));

      const res = await createProduct(formData);
      if (!res.ok) throw new Error(res.message);

      toast.success("✅ Product created");
      setMessage({ type: "success", text: "Product added successfully" });

      setForm({
        name: "",
        category: "",
        status: "available",
        description: "",
      });
      setVarieties([
        { name: "", price: "" },
        { name: "", price: "" },
        { name: "", price: "" },
      ]);
      setImages([]);

      // setTimeout(() => navigate("/product"), 1200);
    } catch (err) {
      toast.error(err.message || "Server error");
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="bg-[#eaeaea] min-h-screen p-10">
      <div className="mx-auto max-w-lg bg-white rounded-xl shadow">
        <div className="bg-[#141414] text-white text-center py-4 rounded-t-xl">
          <h2 className="text-2xl font-bold font-sans ">Add New Food</h2>

        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3 h-[77vh] overflow-y-auto">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Food name"
            className="w-full border px-3 py-2 rounded"
          />

          {["First", "Second", "Third"].map((label, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder={`${label} Size`}
                value={varieties[i].name}
                onChange={(e) =>
                  handleVarietyChange(i, "name", e.target.value)
                }
                className="flex-1 border px-3 py-2 rounded"
              />
              <input
                type="number"
                placeholder="Price"
                value={varieties[i].price}
                onChange={(e) =>
                  handleVarietyChange(i, "price", e.target.value)
                }
                className="flex-1 border px-3 py-2 rounded"
              />
            </div>
          ))}

          {!addcategories ? (
            <div className="flex gap-3">
              <select
                value={form.category}
                onChange={handleChange}
                name="category"
                className="w-1/2 border px-3 py-2 rounded"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setAddCategories(true)}
                className="flex items-center gap-1 text-[#082C2C]"
              >
                <BadgePlus size={18} /> Add
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category"
                className="border px-3 py-2 rounded"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!newCategory.trim())
                    return toast.error("Enter category name");
                  const res = await addCategory(newCategory);
                  if (res.ok) {
                    toast.success("Category added");
                    setNewCategory("");
                    setAddCategories(false);
                    loadCategories();
                  } else toast.error(res.message);
                }}
                className="bg-[#0a0b0bde] text-white px-4 rounded"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAddCategories(false)}
              >
                <ArrowDownRight />
              </button>
            </div>
          )}

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={maxDesc}
            placeholder="Description"
            className="w-full border px-3 py-2 rounded h-24"
          />

          <input type="file" multiple accept="image/*" onChange={handleFiles} className="" />

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img.url} className="h-20 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <h6 className=" text-sm text-gray-400">Image size must be less than 5MB </h6>
          <button
            disabled={loading}
            className="w-full bg-[#0a0b0bde] text-white py-2 rounded"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
          {message && (
            <p
              className={`text-center ${message.type === "error"
                  ? "text-red-600"
                  : "text-green-600"
                }`}
            >
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
// DEBUG CHANGE
