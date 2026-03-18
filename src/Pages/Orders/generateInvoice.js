// generateInvoice.js
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generateInvoice = async (order) => {
  try {
    // Format date and time
    const orderDate = new Date(order.createdAt);
    const dateStr = orderDate.toLocaleDateString();
    const timeStr = orderDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Create a temporary container for the invoice
    const invoiceContainer = document.createElement('div');
    invoiceContainer.style.position = 'absolute';
    invoiceContainer.style.left = '-9999px';
    invoiceContainer.style.top = '-9999px';
    invoiceContainer.style.width = '80mm';
    invoiceContainer.style.padding = '10px';
    invoiceContainer.style.backgroundColor = 'white';
    invoiceContainer.style.fontFamily = "'Courier New', monospace";
    invoiceContainer.style.fontSize = '12px';
    
    // Build the invoice HTML
    invoiceContainer.innerHTML = `
      <div id="invoice-content" style="width: 80mm; max-width: 80mm;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 10px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold;">Hungzo </h2>
          <p style="margin: 2px 0; font-size: 11px; color: #666;">Your Favorite Food, Delivered Fast</p>
          <hr style="border-top: 1px dashed #000; margin: 5px 0;">
        </div>

        <!-- Order Info -->
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="font-weight: bold;">Invoice #:</span>
            <span>${order._id.substring(order._id.length - 8)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="font-weight: bold;">Date:</span>
            <span>${dateStr}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="font-weight: bold;">Time:</span>
            <span>${timeStr}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
        
          </div>
        </div>

        <!-- Customer Info -->
        <div style="margin-bottom: 10px;">
          <h3 style="margin: 0 0 5px 0; font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 2px;">Customer Details</h3>
          <div style="margin-bottom: 3px;">
            <span style="font-weight: bold;">Name: </span>
            <span>${order.user?.restaurantId.ownerName|| order.user?.email || 'N/A'}</span>
          </div>
          ${order.userDetails?.phone ? `
            <div>
              <span style="font-weight: bold;">Phone: </span>
              <span>${order.userDetails.phone}</span>
            </div>
          ` : ''}
        </div>

        <!-- Delivery Address -->
        <div style="margin-bottom: 10px;">
          <h3 style="margin: 0 0 5px 0; font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 2px;">Delivery Address</h3>
          <p style="margin: 0; font-size: 11px; line-height: 1.3;">${order.shippingAddress || 'N/A'}</p>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 10px;">
          <h3 style="margin: 0 0 5px 0; font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 2px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr>
                <th style="border-bottom: 1px solid #000; text-align: left; padding: 2px;">Item</th>
                <th style="border-bottom: 1px solid #000; text-align: center; padding: 2px;">Qty</th>
                <th style="border-bottom: 1px solid #000; text-align: right; padding: 2px;">Price</th>
                <th style="border-bottom: 1px solid #000; text-align: right; padding: 2px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="border-bottom: 1px dotted #ccc; padding: 2px;">
                    ${item.productName}
                    ${item.varietyName ? `<span style="font-size: 10px; color: #666;"> (${item.varietyName})</span>` : ''}
                  </td>
                  <td style="border-bottom: 1px dotted #ccc; text-align: center; padding: 2px;">${item.quantity}</td>
                  <td style="border-bottom: 1px dotted #ccc; text-align: right; padding: 2px;">₹${item.price}</td>
                  <td style="border-bottom: 1px dotted #ccc; text-align: right; padding: 2px;">₹${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Bill Summary -->
        <div style="margin-bottom: 10px;">
          <h3 style="margin: 0 0 5px 0; font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 2px;">Bill Summary</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>Subtotal:</span>
            <span>₹${order.subTotal || order.items.reduce((sum, item) => sum + item.total, 0)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>Delivery:</span>
            <span>₹${order.deliveryCharge || 0}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>GST:</span>
            <span>₹${order.gstAmount || 0}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 5px; padding-top: 5px; border-top: 2px solid #000; font-weight: bold;">
            <span>Grand Total:</span>
            <span>₹${order.totalAmount}</span>
          </div>
        </div>

        <!-- Payment Info -->
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="font-weight: bold;">Payment Method:</span>
            <span>${order.paymentMethod || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: bold;">Payment Status:</span>
            <span>${order.paymentStatus || 'N/A'}</span>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 15px;">
          <hr style="border-top: 1px dashed #000; margin: 5px 0;">
          <p style="margin: 3px 0; font-size: 10px;">Thank you for your order!</p>
          <p style="margin: 3px 0; font-size: 10px; color: #666;">support@abcd.com | 1800--000-0</p>
          <p style="margin: 3px 0; font-size: 9px; font-style: italic; color: #888;">* Computer generated invoice</p>
        </div>
      </div>
    `;

    // Add to document
    document.body.appendChild(invoiceContainer);

    // Convert to canvas
    const canvas = await html2canvas(invoiceContainer.querySelector('#invoice-content'), {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 320, // 80mm in pixels at 96 DPI
      windowWidth: 320
    });

    // Create PDF
    const pdfWidth = 80; // mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    const pdf = new jsPDF({
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Generate filename and save
    const filename = `Invoice_${order._id.substring(order._id.length - 6)}_${dateStr.replace(/\//g, '-')}.pdf`;
    pdf.save(filename);

    // Clean up
    document.body.removeChild(invoiceContainer);

  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

export default generateInvoice;