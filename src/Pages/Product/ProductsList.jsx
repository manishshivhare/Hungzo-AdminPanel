import React, { useEffect, useState } from "react";
import {
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  PlusIcon,
  MinusIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function ProductsList() {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);

  /* ========================= */
  /* DUMMY CATEGORIES */
  /* ========================= */
  const categories = [
    { _id: "1", name: "Burger", color: "bg-orange-100 text-orange-700" },
    { _id: "2", name: "Pizza", color: "bg-red-100 text-red-700" },
    { _id: "3", name: "Drinks", color: "bg-blue-100 text-blue-700" },
    { _id: "4", name: "Desserts", color: "bg-pink-100 text-pink-700" },
    { _id: "5", name: "Sides", color: "bg-green-100 text-green-700" },
  ];

  /* ========================= */
  /* LOAD DUMMY PRODUCTS */
  /* ========================= */
  useEffect(() => {
    setProducts([
      {
        _id: "p1",
        name: "Cheese Burger",
        description: "Juicy beef patty with melted cheese, fresh lettuce, and special sauce",
        category: "1",
        status: "available",
        images: [],
        varieties: [
          { name: "Small", price: 99 },
          { name: "Medium", price: 129 },
          { name: "Large", price: 149 },
        ],
      },
      {
        _id: "p2",
        name: "Cold Coffee",
        description: "Chilled coffee with whipped cream and caramel drizzle",
        category: "3",
        status: "not available",
        images: [],
        varieties: [{ name: "Regular", price: 79 }],
      },
      {
        _id: "p3",
        name: "Margherita Pizza",
        description: "Classic pizza with fresh mozzarella and basil",
        category: "2",
        status: "available",
        images: [],
        varieties: [
          { name: "Personal", price: 199 },
          { name: "Medium", price: 349 },
          { name: "Family", price: 499 },
        ],
      },
    ]);
  }, []);

  /* ========================= */
  /* UPDATE PRODUCT */
  /* ========================= */
  const handleUpdate = (e) => {
    e.preventDefault();
    setProducts((prev) =>
      prev.map((p) =>
        p._id === editingProduct._id ? editingProduct : p
      )
    );
    toast.success("Product updated successfully!");
    setEditingProduct(null);
  };

  /* ========================= */
  /* DELETE PRODUCT */
  /* ========================= */
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p._id !== id));
    toast.success("Product deleted successfully!");
  };

  /* ========================= */
  /* STATUS CHANGE */
  /* ========================= */
  const updateStatus = (id, status) => {
    setStatusUpdating(id);
    setTimeout(() => {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, status } : p
        )
      );
      setStatusUpdating(null);
      toast.success("Status updated!");
    }, 400);
  };

  /* ========================= */
  /* FILTER */
  /* ========================= */
  const filteredProducts = products.filter((p) => {
    const query = q.toLowerCase();
    const categoryName =
      categories.find((c) => c._id === p.category)?.name.toLowerCase() || "";
    return (
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      categoryName.includes(query)
    );
  });

  /* ========================= */
  /* ADD NEW VARIETY */
  /* ========================= */
  const addVariety = () => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      varieties: [...editingProduct.varieties, { name: "", price: 0 }]
    });
  };

  /* ========================= */
  /* REMOVE VARIETY */
  /* ========================= */
  const removeVariety = (index) => {
    if (!editingProduct) return;
    const newVarieties = [...editingProduct.varieties];
    newVarieties.splice(index, 1);
    setEditingProduct({ ...editingProduct, varieties: newVarieties });
  };

  return (
    <div className="px-6 pt-5 overflow-hidden h-[98vh] bg-gradient-to-b from-gray-50 to-gray-100">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-1">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-2">Manage your menu items, pricing, and availability</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Add New Product
          </button>
        </div>
      </div>

      {/* SEARCH  SECTION */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-1">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, descriptions, or categories..."
              className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl w-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-300"
            />
          </div>

        
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
            <div className="text-sm text-green-600 font-medium">Available Products</div>
            <div className="text-2xl font-bold text-green-700 mt-1">
              {products.filter(p => p.status === 'available').length}
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
            <div className="text-sm text-blue-600 font-medium">Total Products</div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{products.length}</div>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-100">
            <div className="text-sm text-gray-600 font-medium">Categories</div>
            <div className="text-2xl font-bold text-gray-700 mt-1">{categories.length}</div>
          </div>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-900 to-slate-800">
              <tr>
                <th className="p-6 text-left text-white font-semibold text-sm uppercase tracking-wider">Product</th>
                <th className="p-6 text-center text-white font-semibold text-sm uppercase tracking-wider">Category</th>
                <th className="p-6 text-center text-white font-semibold text-sm uppercase tracking-wider">Varieties</th>
                <th className="p-6 text-center text-white font-semibold text-sm uppercase tracking-wider">Status</th>
                <th className="p-6 text-right text-white font-semibold text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <React.Fragment key={p._id}>
                  <tr className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-6">
                      <div 
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => setExpandedProduct(expandedProduct === p._id ? null : p._id)}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                            <PhotoIcon className="w-6 h-6 text-gray-500" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{p.name}</h3>
                            {expandedProduct === p._id ? 
                              <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : 
                              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                            }
                          </div>
                          <p className="text-gray-600 mt-1 line-clamp-1">{p.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-6 text-center">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${categories.find((c) => c._id === p.category)?.color}`}>
                        {categories.find((c) => c._id === p.category)?.name}
                      </span>
                    </td>

                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-gray-900 font-medium">{p.varieties.length} sizes</span>
                        <span className="text-sm text-gray-500">
                          From ₹{Math.min(...p.varieties.map(v => v.price))}
                        </span>
                      </div>
                    </td>

                    <td className="p-6 text-center">
                      <div className="flex justify-center">
                        <div className="relative">
                          <select
                            value={p.status}
                            disabled={statusUpdating === p._id}
                            onChange={(e) => updateStatus(p._id, e.target.value)}
                            className={`appearance-none px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${p.status === "available"
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 hover:border-green-300"
                                : "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 hover:border-red-300"
                              } focus:outline-none focus:ring-2 focus:ring-opacity-50 ${p.status === "available" ? "focus:ring-green-300" : "focus:ring-red-300"
                              }`}
                          >
                            <option value="available">Available</option>
                            <option value="not available">Not Available</option>
                          </select>
                          {statusUpdating === p._id && (
                            <div className="absolute inset-0 bg-white bg-opacity-70 rounded-lg flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-2.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600 transition-all duration-200 transform hover:scale-105"
                          title="Edit product"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-2.5 rounded-lg border border-gray-200 hover:border-red-400 hover:bg-red-50 text-red-600 transition-all duration-200 transform hover:scale-105"
                          title="Delete product"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED DETAILS */}
                  {expandedProduct === p._id && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="p-6">
                        <div className="pl-20 pr-6">
                          <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
                              Product Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                                <p className="text-gray-600">{p.description}</p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-3">Pricing & Varieties</h5>
                                <div className="space-y-2">
                                  {p.varieties.map((variety, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                      <span className="font-medium text-gray-800">{variety.name}</span>
                                      <span className="font-bold text-gray-900">₹{variety.price}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {!filteredProducts.length && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ExclamationTriangleIcon className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                <p className="text-gray-600 mt-1">Update product details and pricing</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* MODAL BODY */}
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* IMAGE UPLOAD SECTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Product Images</label>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-shrink-0">
                      <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors duration-200">
                        <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">Image {i}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                    >
                      <PlusIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-600">Add Image</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* BASIC INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-300"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-300"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-300"
                  placeholder="Describe your product..."
                />
              </div>

              {/* VARIETIES */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Varieties & Pricing</label>
                  <button
                    type="button"
                    onClick={addVariety}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors duration-200 flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Variety
                  </button>
                </div>

                <div className="space-y-4">
                  {editingProduct.varieties.map((variety, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        value={variety.name}
                        onChange={(e) => {
                          const newVarieties = [...editingProduct.varieties];
                          newVarieties[index].name = e.target.value;
                          setEditingProduct({ ...editingProduct, varieties: newVarieties });
                        }}
                        placeholder="Size/Variety name"
                        className="flex-1 border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-300"
                      />
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={variety.price}
                          onChange={(e) => {
                            const newVarieties = [...editingProduct.varieties];
                            newVarieties[index].price = parseInt(e.target.value) || 0;
                            setEditingProduct({ ...editingProduct, varieties: newVarieties });
                          }}
                          className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-300 w-32"
                        />
                      </div>
                      {editingProduct.varieties.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariety(index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                        >
                          <MinusIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <CheckIcon className="w-5 h-5 inline mr-2" />
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}