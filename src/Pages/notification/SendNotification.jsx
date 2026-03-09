// SendNotification.jsx
import React, { useState } from 'react';

const SendNotification = () => {
  const [notificationType, setNotificationType] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [schedule, setSchedule] = useState('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [priority, setPriority] = useState('normal');
  const [sound, setSound] = useState('default');
  const [action, setAction] = useState('none');
  const [actionUrl, setActionUrl] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle notification send logic
    console.log({
      notificationType,
      title,
      message,
      image,
      schedule,
      scheduledDate,
      scheduledTime,
      priority,
      sound,
      action,
      actionUrl
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Send Button */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Compose Notification</h2>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <span>📤</span> Send Notification
        </button>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notification Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Send to
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="notificationType"
                  value="all"
                  checked={notificationType === 'all'}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">All Users</span>
              </label>
          
           
            </div>
          </div>

       
          {/* Notification Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Notification Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., New Feature Update"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Notification Message */}
          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Notification Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your notification message here..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notification Image (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <span>📎 Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {image && (
                <div className="relative">
                  <img src={image} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>


      
          {/* Action on Click */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Action on Click
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="action"
                  value="none"
                  checked={action === 'none'}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">No Action</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="action"
                  value="url"
                  checked={action === 'url'}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Open URL</span>
              </label>
            </div>

            {action === 'url' && (
              <div className="mt-2">
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

          </div>
        </form>
      </div>

     
    </div>
  );
};

export default SendNotification;