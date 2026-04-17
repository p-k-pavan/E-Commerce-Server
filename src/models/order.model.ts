import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  orderId: {
    type: String,
    required: [true, "Provide orderId"],
    unique: true,
  },

  list_items: [
    {
      productId: {
        type: mongoose.Schema.ObjectId,
        ref: "product",
      },
      product_details: {
        name: String,
        image: String,
        slug: String,
      },
      quantity: Number,
      discount: Number,
      price: Number,
      total: Number,
    },
  ],

  paymentId: {
    type: String,
    default: "NA",
  },

  payment_status: {
    type: String,
    default: "",
  },

  delivery_address: {
    type: mongoose.Schema.ObjectId,
    ref: "address",
  },

  subTotalAmt: {
    type: Number,
    default: 0,
  },

  totalAmt: {
    type: Number,
    default: 0,
  },

  invoice_receipt: {
    type: String,
    default: "",
  },

  delivery_date: {
    type: Date,
    default: null,
  },

  delivery_status: {
    type: String,
    default: "PENDING",
    enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"],
  },

  reson_for_cancellation: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

const OrderModel = mongoose.model('order',orderSchema)

export default OrderModel