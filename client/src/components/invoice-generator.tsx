import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, FileText } from "lucide-react";

interface InvoiceGeneratorProps {
  order: any;
  type: 'invoice' | 'shipping';
}

export function InvoiceGenerator({ order, type }: InvoiceGeneratorProps) {
  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = type === 'invoice' ? generateInvoiceHTML(order) : generateShippingSlipHTML(order);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${type === 'invoice' ? 'Tax Invoice' : 'Shipping Slip'} - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { margin-bottom: 20px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .customer-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .totals { margin-left: auto; width: 300px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            .gst-info { margin-top: 20px; font-size: 12px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <Button 
      onClick={generatePDF}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Download {type === 'invoice' ? 'Tax Invoice' : 'Shipping Slip'}
    </Button>
  );
}

function generateInvoiceHTML(order: any) {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const invoiceNumber = `INV-${order.id.toString().padStart(6, '0')}`;
  
  return `
    <div class="header">
      <h1>TAX INVOICE</h1>
      <p>Invoice No: ${invoiceNumber}</p>
      <p>Date: ${currentDate}</p>
    </div>

    <div class="company-info">
      <h3>${order.vendor?.name || 'Vendor Name'}</h3>
      <p>GSTIN: ${order.vendor?.gstin || '22AAAAA0000A1Z5'}</p>
      <p>Address: ${order.vendor?.address || 'Vendor Address'}</p>
      <p>State: ${order.vendor?.state || 'Gujarat'} | State Code: 24</p>
    </div>

    <div class="customer-info">
      <h4>Bill To:</h4>
      <p><strong>${order.customerInfo?.firstName} ${order.customerInfo?.lastName}</strong></p>
      <p>Email: ${order.customerInfo?.email}</p>
      <p>Phone: ${order.customerInfo?.phone}</p>
      <p>Address: ${order.shippingAddress?.address}</p>
      <p>${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.zipCode}</p>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>S.No.</th>
          <th>Product Description</th>
          <th>Quantity</th>
          <th>Rate (₹)</th>
          <th>Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${order.items?.map((item: any, index: number) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.product?.name || 'Product'}</td>
            <td>${item.quantity}</td>
            <td>${parseFloat(item.price).toFixed(2)}</td>
            <td>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
          </tr>
        `).join('') || ''}
      </tbody>
    </table>

    <div class="totals">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px;">Subtotal:</td>
          <td style="padding: 5px; text-align: right;">₹${(order.subtotal || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 5px;">CGST (9%):</td>
          <td style="padding: 5px; text-align: right;">₹${((order.taxAmount || 0) / 2).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 5px;">SGST (9%):</td>
          <td style="padding: 5px; text-align: right;">₹${((order.taxAmount || 0) / 2).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 5px;">Shipping Charges:</td>
          <td style="padding: 5px; text-align: right;">₹${(order.shippingFee || 0).toFixed(2)}</td>
        </tr>
        <tr style="border-top: 2px solid #000; font-weight: bold;">
          <td style="padding: 5px;">Total Amount:</td>
          <td style="padding: 5px; text-align: right;">₹${(order.total || 0).toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div class="gst-info">
      <p><strong>GST Details:</strong></p>
      <p>• This is a computer-generated invoice and does not require a signature</p>
      <p>• Total GST Amount: ₹${(order.taxAmount || 0).toFixed(2)} (CGST: ₹${((order.taxAmount || 0) / 2).toFixed(2)} + SGST: ₹${((order.taxAmount || 0) / 2).toFixed(2)})</p>
      <p>• Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>This is a system-generated document. For queries, contact: support@lelekart.com</p>
    </div>
  `;
}

function generateShippingSlipHTML(order: any) {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const awbNumber = `AWB${order.id.toString().padStart(8, '0')}`;
  
  return `
    <div class="header">
      <h1>SHIPPING SLIP</h1>
      <p>AWB Number: ${awbNumber}</p>
      <p>Date: ${currentDate}</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div style="width: 45%;">
        <h4>FROM:</h4>
        <p><strong>${order.vendor?.name || 'Vendor Name'}</strong></p>
        <p>${order.vendor?.address || 'Vendor Address'}</p>
        <p>${order.vendor?.city || 'City'}, ${order.vendor?.state || 'State'}</p>
        <p>PIN: ${order.vendor?.zipCode || '000000'}</p>
        <p>Phone: ${order.vendor?.phone || '+91 99999 99999'}</p>
      </div>
      <div style="width: 45%;">
        <h4>TO:</h4>
        <p><strong>${order.customerInfo?.firstName} ${order.customerInfo?.lastName}</strong></p>
        <p>${order.shippingAddress?.address}</p>
        <p>${order.shippingAddress?.city}, ${order.shippingAddress?.state}</p>
        <p>PIN: ${order.shippingAddress?.zipCode}</p>
        <p>Phone: ${order.customerInfo?.phone}</p>
      </div>
    </div>

    <div style="border: 2px solid #000; padding: 15px; margin-bottom: 20px;">
      <h3>PACKAGE DETAILS</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px; border-bottom: 1px solid #ddd;"><strong>Order ID:</strong></td>
          <td style="padding: 5px; border-bottom: 1px solid #ddd;">#${order.id}</td>
        </tr>
        <tr>
          <td style="padding: 5px; border-bottom: 1px solid #ddd;"><strong>Number of Items:</strong></td>
          <td style="padding: 5px; border-bottom: 1px solid #ddd;">${order.items?.length || 0}</td>
        </tr>
        <tr>
          <td style="padding: 5px; border-bottom: 1px solid #ddd;"><strong>Payment Method:</strong></td>
          <td style="padding: 5px; border-bottom: 1px solid #ddd;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid'}</td>
        </tr>
        <tr>
          <td style="padding: 5px; border-bottom: 1px solid #ddd;"><strong>COD Amount:</strong></td>
          <td style="padding: 5px; border-bottom: 1px solid #ddd;">${order.paymentMethod === 'cod' ? `₹${(order.total || 0).toFixed(2)}` : '₹0.00'}</td>
        </tr>
        <tr>
          <td style="padding: 5px;"><strong>Declared Value:</strong></td>
          <td style="padding: 5px;">₹${(order.total || 0).toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>S.No.</th>
          <th>Product Name</th>
          <th>Quantity</th>
          <th>Weight (kg)</th>
        </tr>
      </thead>
      <tbody>
        ${order.items?.map((item: any, index: number) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.product?.name || 'Product'}</td>
            <td>${item.quantity}</td>
            <td>${(parseFloat(item.product?.weight || '0.5') * item.quantity).toFixed(2)}</td>
          </tr>
        `).join('') || ''}
      </tbody>
    </table>

    <div style="margin-top: 30px; display: flex; justify-content: space-between;">
      <div style="width: 30%; text-align: center; border: 1px solid #000; padding: 20px;">
        <p><strong>SELLER SIGNATURE</strong></p>
        <div style="height: 50px;"></div>
        <p>Date: ${currentDate}</p>
      </div>
      <div style="width: 30%; text-align: center; border: 1px solid #000; padding: 20px;">
        <p><strong>COURIER SIGNATURE</strong></p>
        <div style="height: 50px;"></div>
        <p>Date: ________</p>
      </div>
      <div style="width: 30%; text-align: center; border: 1px solid #000; padding: 20px;">
        <p><strong>BUYER SIGNATURE</strong></p>
        <div style="height: 50px;"></div>
        <p>Date: ________</p>
      </div>
    </div>

    <div class="footer">
      <p><strong>Instructions:</strong></p>
      <p>• Handle with care • Do not bend • Keep dry</p>
      <p>• Contact seller for any damage during transit</p>
      <p style="margin-top: 20px;">Generated on: ${new Date().toLocaleString('en-IN')}</p>
    </div>
  `;
}