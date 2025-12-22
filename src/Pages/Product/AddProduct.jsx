import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgePlus, ArrowDownRight } from "lucide-react";
import toast from "react-hot-toast";

export default function AddProductPage() {
  const navigate = useNavigate();

  /* ========================= */
  /* DUMMY CATEGORIES */
  /* ========================= */
  const [categories, setCategories] = useState([
    { _id: "1", name: "Burger" },
    { _id: "2", name: "Pizza" },
    { _id: "3", name: "Drinks" },
  ]);

  const [addcategories, setaddCategories] = useState(false);

  /* ========================= */
  /* FORM STATE */
  /* ========================= */
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

  /* ========================= */
  /* INPUT HANDLERS */
  /* ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVarietyChange = (index, field, value) => {
    const updated = [...varieties];
    updated[index][field] = value;
    setVarieties(updated);
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[idx].url);
      updated.splice(idx, 1);
      return updated;
    });
  };

  /* ========================= */
  /* SUBMIT (DUMMY SAVE) */
  /* ========================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim())
      return setMessage({ type: "error", text: "Product name is required" });
    if (!form.category)
      return setMessage({ type: "error", text: "Category is required" });
    if (images.length === 0)
      return setMessage({ type: "error", text: "Upload at least one image" });

    setLoading(true);
    setMessage(null);

    /* CREATE DUMMY PRODUCT */
    const newProduct = {
      _id: Date.now().toString(),
      ...form,
      varieties: varieties.filter((v) => v.name && v.price),
      images: images.map((img) => img.url),
      createdAt: new Date().toISOString(),
    };

    /* SAVE TO LOCAL STORAGE */
    const existing = JSON.parse(localStorage.getItem("products") || "[]");
    localStorage.setItem(
      "products",
      JSON.stringify([...existing, newProduct])
    );

    toast.success("✅ Product added (dummy)");
    setLoading(false);

    /* RESET */
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

    setTimeout(() => navigate("/my-products"), 800);
  };

  return (
    <div className="bg-[#FCE8E6] h-screen overflow-y-auto p-10 ">
      <div className="mx-auto max-w-lg mb-8 bg-white rounded-xl shadow-card">
        <div className="bg-[#082C2C] text-white text-center py-8 rounded-ss-2xl rounded-se-2xl">
          <h2 className="text-2xl font-semibold">Add New Food</h2>
          <p className="text-sm text-slate-200 mt-2">
            Dummy version (No API)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* NAME */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Food name"
            className="w-full border px-3 py-2 rounded"
          />

          {/* VARIETIES */}
          {["First", "Second", "Third"].map((label, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder={`${label} Type`}
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

          {/* CATEGORY */}
          {!addcategories ? (
            <div className="flex gap-3">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
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
                onClick={() => setaddCategories(true)}
                className="text-[#082C2C] flex items-center gap-1"
              >
                <BadgePlus size={18} /> Add
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                placeholder="New category"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setCategories((prev) => [
                      ...prev,
                      { _id: Date.now().toString(), name: e.target.value },
                    ]);
                    setaddCategories(false);
                  }
                }}
                className="border px-3 py-2 rounded"
              />
              <button
                type="button"
                onClick={() => setaddCategories(false)}
              >
                <ArrowDownRight />
              </button>
            </div>
          )}

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={maxDesc}
            placeholder="Description"
            className="w-full border px-3 py-2 rounded h-24"
          />

          {/* IMAGES */}
          <input type="file" multiple accept="image/*" onChange={handleFiles} />

          <button
            disabled={loading}
            className="w-full bg-[#082C2C] text-white py-2 rounded"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>

          {message && (
            <p
              className={`text-center ${
                message.type === "error" ? "text-red-600" : "text-green-600"
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
