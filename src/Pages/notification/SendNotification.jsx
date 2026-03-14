import React, { useState } from 'react';

const SendNotification = () => {
  const [notificationType, setNotificationType] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [action, setAction] = useState('none');
  const [actionUrl, setActionUrl] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !message) {
      alert("Title and message required");
      return;
    }

    const payload = {
      to: "/topics/allUsers",
      notification: {
        title: title,
        body: message,
        image: image || ""
      },
      data: {
        url: action === "url" ? actionUrl : ""
      }
    };

    try {

      await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "key=-kdd-ZpB_5jijzCTcRLGWsfMTohVyKPlrnwLp-wE63k"
        },
        body: JSON.stringify(payload)
      });

      alert("Notification sent successfully 🚀");

      setTitle('');
      setMessage('');
      setImage(null);
      setAction('none');
      setActionUrl('');

    } catch (error) {
      console.log(error);
      alert("Failed to send notification");
    }
  };

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Compose Notification</h2>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          📤 Send Notification
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Send To */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Send To
            </label>

            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="all"
                  checked={notificationType === 'all'}
                  onChange={(e) => setNotificationType(e.target.value)}
                />
                <span className="ml-2 text-sm">All Users</span>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Notification Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-2 mt-2"
              placeholder="Notification title"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Notification Message
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="w-full border rounded-lg p-2 mt-2"
              placeholder="Type your message"
            />
          </div>

          {/* Image */}
          <div>

            <label className="text-sm font-medium text-gray-700">
              Notification Image
            </label>

            <div className="flex items-center gap-4 mt-2">

              <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded-lg">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {image && (
                <img
                  src={image}
                  alt="preview"
                  className="h-16 w-16 object-cover rounded"
                />
              )}

            </div>

          </div>

          {/* Action */}
          <div>

            <label className="text-sm font-medium text-gray-700">
              Action on Click
            </label>

            <div className="flex gap-4 mt-2">

              <label>
                <input
                  type="radio"
                  value="none"
                  checked={action === "none"}
                  onChange={(e) => setAction(e.target.value)}
                />
                <span className="ml-2">None</span>
              </label>

              <label>
                <input
                  type="radio"
                  value="url"
                  checked={action === "url"}
                  onChange={(e) => setAction(e.target.value)}
                />
                <span className="ml-2">Open URL</span>
              </label>

            </div>

            {action === "url" && (
              <input
                type="url"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full border rounded-lg p-2 mt-3"
              />
            )}

          </div>

        </form>

      </div>
    </div>
  );
};

export default SendNotification;