import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  PencilIcon, TrashIcon, MagnifyingGlassIcon, PhotoIcon,
} from "@heroicons/react/24/outline";

import {
  fetchCategories, myProducts, updateProduct, deleteProduct
} from "../../Api";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [statusLoading, setStatusLoading] = useState(null);
  // console.log(editingProduct);

  /* ================= LOAD ================= */
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    const res = await fetchCategories();
    if (res?.ok) setCategories(res.categories || []);
  };

  const loadProducts = async () => {
    const res = await myProducts();
    if (res?.ok) {
      setProducts(
        Array.isArray(res.data?.products)
          ? res.data.products
          : res.data || []
      );
    } else toast.error("Failed to load products");
  };

  /* ================= FILTER ================= */
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const cat =
      categories.find((c) => c._id === p.category)?.name?.toLowerCase() || "";
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      cat.includes(q)
    );
  });

  /* ================= STATUS ================= */
  const updateStatus = async (id, status) => {
    setStatusLoading(id);
    try {
      const fd = new FormData();
      fd.append("status", status);
      await updateProduct(id, fd);

      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status } : p))
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
    setStatusLoading(null);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!confirm("Delete this product permanently?")) return;

    try {
      const res = await deleteProduct(id); // ✅ CALL DELETE API

      if (!res?.ok) throw new Error();

      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted permanently");
    } catch (err) {
      toast.error("Delete failed");
    }
  };


  /* ================= EDIT ================= */
  const handleEdit = (product) => {
    setEditingProduct({
      ...product,
      varieties: product.varieties || [],
    });
    setSelectedImages([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= VARIETIES ================= */
  const handleVarietyChange = (index, field, value) => {
    setEditingProduct((prev) => {
      const updated = [...prev.varieties];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, varieties: updated };
    });
  };

  const addVariety = () => {
    setEditingProduct((prev) => ({
      ...prev,
      varieties: [...prev.varieties, { name: "", price: "" }],
    }));
  };

  const removeVariety = (index) => {
    setEditingProduct((prev) => {
      const updated = [...prev.varieties];
      updated.splice(index, 1);
      return { ...prev, varieties: updated };
    });
  };

  /* ================= IMAGES ================= */
  const handleImageSelect = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };

  /* ================= UPDATE (FIXED) ================= */
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", editingProduct.name);
      formData.append("description", editingProduct.description);
      formData.append("category", editingProduct.category);
      formData.append("status", editingProduct.status);

      // ✅ FIX: send varieties as sub-doc fields
      const validVarieties = editingProduct.varieties.filter(
        (v) => v.name.trim() && v.price
      );

      validVarieties.forEach((v, index) => {
        formData.append(`varieties[${index}][name]`, v.name);
        formData.append(`varieties[${index}][price]`, Number(v.price));
        formData.append(
          `varieties[${index}][isAvailable]`,
          v.isAvailable ?? true
        );
      });

      // images
      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      await updateProduct(editingProduct._id, formData);

      toast.success("Product updated");
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="px-6 py-4 h-[90vh] overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-4">Products</h1>

      {/* SEARCH */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-10 pr-4 py-2 border rounded-md w-full"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-center">Varieties</th>
              <th className="p-3 text-center">Category</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                <td className="p-4 flex items-center gap-3">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} className="w-12 h-12 rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <PhotoIcon className="w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.description}</p>
                  </div>
                </td>

                <td className="p-4 text-center">
                  {p.varieties?.length || 0}
                </td>

                <td className="p-4 text-center">
                  {categories.find((c) => c._id === p.category)?.name || "—"}
                </td>

                <td className="p-4 text-center">
                  <select
                    value={p.status}
                    disabled={statusLoading === p._id}
                    onChange={(e) =>
                      updateStatus(p._id, e.target.value)
                    }
                    className={`px-3 py-1 rounded text-white ${p.status === "available"
                      ? "bg-green-600"
                      : "bg-red-600"
                      }`}
                  >
                    <option value="available">Available</option>
                    <option value="not available">Not Available</option>
                  </select>
                </td>

                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => handleEdit(p)}>
                    <PencilIcon className="w-5 text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete(p._id)}>
                    <TrashIcon className="w-5 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2"
              onClick={() => setEditingProduct(null)}
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-1">Edit Product</h2>

            <form onSubmit={handleUpdate} className="space-y-2">
              <input
                name="name"
                value={editingProduct.name}
                onChange={handleChange}
                className="w-full border px-3 py-1 rounded"
              />

              <textarea
                name="description"
                value={editingProduct.description}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />

              <select
                name="category"
                value={editingProduct.category}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* VARIETIES */}
              <div className="">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">Varieties</h3>
                  <button
                    type="button"
                    onClick={addVariety}
                    className="text-green-600 text-sm"
                  >
                    + Add
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {editingProduct.varieties.map((v, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        value={v.name}
                        placeholder="Size"
                        onChange={(e) =>
                          handleVarietyChange(i, "name", e.target.value)
                        }
                        className="flex-1 border px-2 py-1 rounded"
                      />
                      <input
                        type="number"
                        value={v.price}
                        placeholder="Price"
                        onChange={(e) =>
                          handleVarietyChange(i, "price", e.target.value)
                        }
                        className="w-24 border px-2 py-1 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariety(i)}
                        className="text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

              </div>
              {/* IMAGE UPLOAD */}
              <div className="mt-2">
                {/* Hidden input */}
                <input
                  type="file"
                  multiple
                  id="product-images"
                  className="hidden"
                  onChange={handleImageSelect}
                />

                {/* Add Image Button */}
                <label
                  htmlFor="product-images"
                  className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-md cursor-pointer
               hover:bg-blue-50 hover:border-blue-400 transition text-blue-600"
                >
                  <PhotoIcon className="w-5 h-4" />
                  <span className="font-medium">Add Images</span>
                </label>

                {/* EXISTING IMAGES */}
                {editingProduct.images?.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {editingProduct.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="product"
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                )}

                {/* NEW IMAGE PREVIEW */}
                {selectedImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {selectedImages.map((file, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                )}
              </div>


              <button className="w-full bg-blue-600 text-white py-2 rounded">
                Update Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
