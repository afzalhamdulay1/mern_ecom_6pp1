const PDFDocument = require("pdfkit");

const generateInvoice = (order, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // Header
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("ECOMMERCE STORE", 50, 57)
      .fontSize(10)
      .text("123 Main Street", 200, 65, { align: "right" })
      .text("New York, NY, 10001", 200, 80, { align: "right" })
      .moveDown();

    // Invoice Info
    doc
      .fillColor("#000000")
      .fontSize(20)
      .text("Invoice", 50, 160);

    generateHr(doc, 185);

    const customerInfoTop = 200;

    doc
      .fontSize(10)
      .text("Order ID:", 50, customerInfoTop)
      .font("Helvetica-Bold")
      .text(order._id.toString(), 150, customerInfoTop)
      .font("Helvetica")
      .text("Invoice Date:", 50, customerInfoTop + 15)
      .text(new Date().toLocaleDateString(), 150, customerInfoTop + 15)
      .text("Balance Due:", 50, customerInfoTop + 30)
      .text(`INR ${order.totalPrice.toLocaleString()}`, 150, customerInfoTop + 30)

      .font("Helvetica-Bold")
      .text(user.name, 300, customerInfoTop)
      .font("Helvetica")
      .text(order.shippingInfo.address, 300, customerInfoTop + 15)
      .text(
        `${order.shippingInfo.city}, ${order.shippingInfo.state}, ${order.shippingInfo.country}`,
        300,
        customerInfoTop + 30
      )
      .moveDown();

    generateHr(doc, 252);

    // Table Header
    const invoiceTableTop = 330;

    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      invoiceTableTop,
      "Item",
      "Description",
      "Unit Cost",
      "Quantity",
      "Line Total"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");

    // Table Content
    let i;
    let invoiceTableContentTop = invoiceTableTop + 30;

    for (i = 0; i < order.orderItems.length; i++) {
      const item = order.orderItems[i];
      const position = invoiceTableContentTop + i * 30;
      generateTableRow(
        doc,
        position,
        item.name,
        "",
        `INR ${item.price.toLocaleString()}`,
        item.quantity,
        `INR ${(item.price * item.quantity).toLocaleString()}`
      );

      generateHr(doc, position + 20);
    }

    const subtotalPosition = invoiceTableContentTop + i * 30 + 30;
    generateTableRow(
      doc,
      subtotalPosition,
      "",
      "",
      "Subtotal",
      "",
      `INR ${order.itemsPrice.toLocaleString()}`
    );

    const taxPosition = subtotalPosition + 20;
    generateTableRow(
      doc,
      taxPosition,
      "",
      "",
      "Tax (GST)",
      "",
      `INR ${order.taxPrice.toLocaleString()}`
    );

    const shippingPosition = taxPosition + 20;
    generateTableRow(
        doc,
        shippingPosition,
        "",
        "",
        "Shipping",
        "",
        `INR ${order.shippingPrice.toLocaleString()}`
      );

    const totalPosition = shippingPosition + 25;
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      totalPosition,
      "",
      "",
      "Total Amount",
      "",
      `INR ${order.totalPrice.toLocaleString()}`
    );
    doc.font("Helvetica");

    // Footer
    doc
      .fontSize(10)
      .text(
        "Thank you for your business. For any queries, contact support@ecom.com",
        50,
        780,
        { align: "center", width: 500 }
      );

    doc.end();
  });
};

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

module.exports = generateInvoice;
