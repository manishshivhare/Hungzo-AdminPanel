import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { PencilIcon, PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";

import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "../../Api";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const createInitialForm = () => ({
  name: "",
  image: null,
  isActive: true,
});

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(createInitialForm);
  const [previewUrl, setPreviewUrl] = useState("");

  const isEditing = editingId.trim().length > 0;

  const loadCategories = async () => {
    setLoading(true);
    const res = await fetchCategories();
    if (res.ok) {
      setCategories(Array.isArray(res.categories) ? res.categories : []);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!form.image) return undefined;
    const url = URL.createObjectURL(form.image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.image]);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        if ((a.isActive ?? true) !== (b.isActive ?? true)) {
          return a.isActive === false ? 1 : -1;
        }
        return (b.productCount ?? 0) - (a.productCount ?? 0);
      }),
    [categories]
  );

  const resetForm = () => {
    setEditingId("");
    setForm(createInitialForm());
    setPreviewUrl("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (!isEditing && !form.image) {
      toast.error("Category image is required");
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("isActive", String(form.isActive));
    if (form.image) payload.append("image", form.image);

    setSubmitting(true);
    const res = isEditing
      ? await updateCategory(editingId, payload)
      : await createCategory(payload);
    setSubmitting(false);

    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    toast.success(isEditing ? "Category updated" : "Category created");
    resetForm();
    await loadCategories();
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name ?? "",
      image: null,
      isActive: category.isActive !== false,
    });
    setPreviewUrl(category.image ?? "");
  };

  const handleDelete = async (category) => {
    if (
      !window.confirm(
        `Delete ${category.name}? This only works when no products are assigned.`
      )
    ) {
      return;
    }

    const res = await deleteCategory(category._id);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    toast.success("Category deleted");
    if (editingId === category._id) resetForm();
    await loadCategories();
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Category Management</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Manage category names, images, and publish state for both the admin inventory and the customer shop.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {isEditing ? "Update category" : "Create category"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Use a clear customer-facing image so category tiles stay consistent across the app.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-800">Name</label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Frozen Foods"
                  className={`${inputClass} mt-1.5`}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">Category image</label>
                <label className="mt-1.5 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        image: event.target.files?.[0] ?? null,
                      }))
                    }
                  />
                  <div className="space-y-2">
                    <PhotoIcon className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="text-sm font-medium text-slate-700">
                      Upload PNG, JPG, or WEBP
                    </p>
                    <p className="text-xs text-slate-500">Recommended under 5 MB.</p>
                  </div>
                </label>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex aspect-square items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Category preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-sm text-slate-400">Image preview</div>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, isActive: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-800">Publish category</div>
                  <div className="text-xs text-slate-500">
                    Hidden categories won’t appear in the customer app menu.
                  </div>
                </div>
              </label>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving..." : isEditing ? "Update category" : "Create category"}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Live categories</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review publish state and product coverage before changes go live.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {sortedCategories.length} total
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-slate-500">Loading categories...</div>
            ) : sortedCategories.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">No categories found yet.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {sortedCategories.map((category) => (
                  <article
                    key={category._id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    <div className="aspect-[16/9] bg-slate-200">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {category.name}
                          </h3>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {category.productCount ?? 0} linked products
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            category.isActive === false
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {category.isActive === false ? "Hidden" : "Live"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
