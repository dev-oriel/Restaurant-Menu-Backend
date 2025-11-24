const PDFDocument = require("pdfkit");

const generateReceipt = (order, res) => {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${order._id}.pdf`
  );

  doc.pipe(res);

  // Header
  doc.fontSize(20).text("Restaurant Receipt", { align: "center" });
  doc.moveDown();

  // Order Details
  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.text(`Table: ${order.tableNumber}`);
  doc.text(`Status: ${order.paymentStatus}`);
  doc.moveDown();

  // Items
  doc.text("Items:", { underline: true });
  order.orderItems.forEach((item) => {
    doc.text(`${item.name} x ${item.qty} - KES ${item.price * item.qty}`);
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total: KES ${order.totalPrice}`, { bold: true });

  if (order.mpesaReceiptNumber) {
    doc.fontSize(10).text(`M-Pesa Ref: ${order.mpesaReceiptNumber}`);
  }

  doc.end();
};

module.exports = { generateReceipt };
