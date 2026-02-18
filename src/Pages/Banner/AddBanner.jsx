import React, { useEffect, useState } from 'react';
import { fetchCategories, myProducts } from '../../Api';
import { createBanner } from '../../Api';
import toast from 'react-hot-toast';

const AddBanner = ({ onBack, onBannerCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    actionType: 'CATEGORY',
    actionId: '',
    isActive: true,
    targetUrl: '',
    description: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState('CATEGORY');
  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await myProducts();
      if (res?.ok) {
        const productsData = res.data?.products || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
      } else {
        toast.error("Failed to load products");
      }
    } catch (err) {
      toast.error("Error loading products");
      console.error('Error loading products:', err);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchCategories();

      if (res?.ok) {
        const categoriesData = res.categories || [];
        const activeCategories = categoriesData.filter(cat => cat.isActive === true);
        setCategories(activeCategories);

        if (activeCategories.length > 0 && !formData.actionId) {
          setFormData(prev => ({ 
            ...prev, 
            actionId: activeCategories[0]._id,
            actionType: 'CATEGORY'
          }));
        }
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      setError('Error loading categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Check total images won't exceed limit
    if (selectedImageFiles.length + files.length > 5) {
      toast.error(`You can upload maximum 5 images. You already have ${selectedImageFiles.length} images selected.`);
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      // Validate file type
      if (!file.type.match('image.*')) {
        invalidFiles.push(file.name);
        return;
      }

      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (too large)`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files: ${invalidFiles.join(', ')}. Please select image files less than 5MB.`);
    }

    if (validFiles.length > 0) {
      setSelectedImageFiles(prev => [...prev, ...validFiles]);
      
      // Create preview URLs for valid files
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }

    // Reset file input to allow selecting same files again
    e.target.value = '';
  };

  const removeImage = (index) => {
    // Revoke the object URL to prevent memory leaks
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }

    setSelectedImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a banner title');
      return;
    }

    if (selectedImageFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    if (type === 'CATEGORY' && !formData.actionId) {
      toast.error('Please select a category');
      return;
    }

    if (type === 'PRODUCT' && !formData.actionId) {
      toast.error('Please select a product');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Required fields
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('actionType', type);
      formDataToSend.append('isActive', formData.isActive ? "true" : "false");
      
      // Append multiple images
      selectedImageFiles.forEach((file, index) => {
        formDataToSend.append('images', file); // Use 'images' field for multiple files
      });

      // Only append actionId if type is not 'None'
      if (type !== 'None') {
        formDataToSend.append('actionId', formData.actionId);
      }

      // Optional fields
      if (formData.targetUrl.trim()) {
        formDataToSend.append('targetUrl', formData.targetUrl.trim());
      }

      if (formData.description.trim()) {
        formDataToSend.append('description', formData.description.trim());
      }

      // Debug info
      console.log('FormData keys:', Array.from(formDataToSend.keys()));
      console.log('Submitting banner data:');
      console.log('- Title:', formData.title);
      console.log('- Action Type:', type);
      console.log('- Action ID:', type !== 'None' ? formData.actionId : 'None');
      console.log('- Is Active:', formData.isActive);
      console.log('- Number of Images:', selectedImageFiles.length);
      selectedImageFiles.forEach((file, index) => {
        console.log(`  Image ${index + 1}:`, file.name, `(${Math.round(file.size / 1024)}KB)`);
      });
      console.log('- Target URL:', formData.targetUrl);
      console.log('- Description:', formData.description);

      // Call API
      const response = await createBanner(formDataToSend);

      if (response.ok) {
        toast.success(response.data?.message || 'Banner created successfully!');
        
        // Clean up all preview URLs
        imagePreviews.forEach(preview => {
          URL.revokeObjectURL(preview);
        });
        
        // Reset form
        resetForm();
        
        // Notify parent component
        if (onBannerCreated) {
          onBannerCreated(response.data?.banner);
        }
        
        // Go back
        if (onBack) {
          onBack();
        }
      } else {
        const errorMsg = response.message || response.error?.message || 'Failed to create banner';
        toast.error(`Error: ${errorMsg}`);
        
        if (response.error) {
          console.error('API Error details:', response.error);
        }
      }
    } catch (err) {
      console.error('Error creating banner:', err);
      toast.error('An error occurred while creating the banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      actionType: 'CATEGORY',
      actionId: categories.length > 0 ? categories[0]._id : '',
      isActive: true,
      targetUrl: '',
      description: ''
    });
    // Clean up all preview URLs
    imagePreviews.forEach(preview => {
      URL.revokeObjectURL(preview);
    });
    setSelectedImageFiles([]);
    setImagePreviews([]);
    setType('CATEGORY');
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    
    setFormData(prev => ({ 
      ...prev, 
      actionType: newType 
    }));
    
    // Reset actionId based on new type
    if (newType === 'CATEGORY') {
      setFormData(prev => ({ 
        ...prev, 
        actionId: categories.length > 0 ? categories[0]._id : '' 
      }));
    } else if (newType === 'PRODUCT') {
      setFormData(prev => ({ 
        ...prev, 
        actionId: products.length > 0 ? products[0]._id : '' 
      }));
    } else if (newType === 'None') {
      setFormData(prev => ({ 
        ...prev, 
        actionId: '' 
      }));
    }
  };

  const renderActionSelect = () => {
    if (type === "CATEGORY") {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Category *
          </label>
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-500">Loading categories...</span>
            </div>
          ) : categories.length > 0 ? (
            <select
              name="actionId"
              value={formData.actionId}
              onChange={handleChange}
              required={type === "CATEGORY"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-red-500">No active categories available</div>
          )}
        </div>
      );
    } else if (type === "PRODUCT") {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Product *
          </label>
          <select
            name="actionId"
            value={formData.actionId}
            onChange={handleChange}
            required={type === "PRODUCT"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name || product.title || `Product ${product._id.substring(0, 6)}`}
              </option>
            ))}
          </select>
        </div>
      );
    } else if (type === "None") {
      return (
        <div className="text-sm text-gray-500">
          No category or product association
        </div>
      );
    }
  };

  // Clean up all preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [imagePreviews]);

  return (
    <div className="px-6 py-3 h-[76vh] overflow-y-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Add New Banner</h2>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Banners
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter banner title"
              />
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Type *
              </label>
              <select
                value={type}
                onChange={handleTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CATEGORY">Category</option>
                <option value="PRODUCT">Product</option>
                <option value="None">None</option>
              </select>
            </div>

            {/* Dynamic Select based on Type */}
            {renderActionSelect()}

            {/* Status */}
            {/* <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active Banner
              </label>
            </div> */}

            <div className="text-sm text-gray-500">
              <p>Active banners will be visible to users</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Images *
                <span className="ml-1 text-xs text-gray-500">
                  ({selectedImageFiles.length}/5 images selected)
                </span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedImageFiles.length > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    {selectedImageFiles.length}/5
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Accepted formats: JPG, PNG, GIF. Max 5 images, 5MB each
              </p>
            </div>

       

            {/* Target URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target URL (Optional)
              </label>
              <input
                type="url"
                name="targetUrl"
                value={formData.targetUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/target-page"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter banner description..."
              />
            </div>
          </div>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Form Data Preview:</h4>
          <div className="text-xs font-mono text-gray-600 space-y-1">
            <div><strong>Title:</strong> {formData.title || 'Not set'}</div>
            <div><strong>Action Type:</strong> {type}</div>
            <div><strong>Action ID:</strong> {formData.actionId || 'None'}</div>
            {/* <div><strong>Is Active:</strong> {formData.isActive ? 'true' : 'false'}</div> */}
            <div><strong>Images Selected:</strong> {selectedImageFiles.length}</div>
            {selectedImageFiles.map((file, index) => (
              <div key={index} className="ml-2">
                <strong>Image {index + 1}:</strong> {file.name} ({Math.round(file.size / 1024)}KB)
              </div>
            ))}
            <div><strong>Target URL:</strong> {formData.targetUrl || 'Not set'}</div>
            <div><strong>Description:</strong> {formData.description || 'Not set'}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onBack();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting || 
                (type === 'CATEGORY' && categories.length === 0) ||
                (type === 'PRODUCT' && products.length === 0) ||
                selectedImageFiles.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Banner'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddBanner;