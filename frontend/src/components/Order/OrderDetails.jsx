import React, { Fragment, useEffect } from "react";
import "./OrderDetails.css";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../Layout/MetaData";
import { Link, useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import { getOrderDetails, clearErrors } from "../../features/order/orderSlice"; // Adjust path as per your project structure
import Loader from "../layout/Loader/Loader";
import { toast } from "react-toastify";

const OrderDetails = () => {
  const { id } = useParams(); // Extract order ID from URL
  const { orderDetails, error, loading } = useSelector(
    (state) => state.newOrder
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      toast.error(error); // Show error notification
      dispatch(clearErrors()); // Clear error state
    }

    dispatch(getOrderDetails(id)); // Fetch order details
  }, [dispatch, id, error]);

  if (loading) return <Loader />; // Show loader while fetching data

  if (!orderDetails) return <p>Order details not available.</p>;

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title="Order Details" />
          <div className="orderDetailsPage">
            <div className="orderDetailsContainer">
              <Typography component="h1">Order #{orderDetails && orderDetails._id}</Typography>
              <Typography>Shipping Info</Typography>
              <div className="orderDetailsContainerBox">
                <div>
                  <p>Name:</p>
                  <span>{orderDetails.user && orderDetails.user.name}</span>
                </div>
                <div>
                  <p>Phone:</p>
                  <span>
                    {orderDetails.shippingInfo && orderDetails.shippingInfo.phoneNo}
                  </span>
                </div>
                <div>
                  <p>Address:</p>
                  <span>
                    {orderDetails.shippingInfo &&
                      `${orderDetails.shippingInfo.address}, ${orderDetails.shippingInfo.city}, ${orderDetails.shippingInfo.state}, ${orderDetails.shippingInfo.pinCode}, ${orderDetails.shippingInfo.country}`}
                  </span>
                </div>
              </div>
              <Typography>Payment</Typography>
              <div className="orderDetailsContainerBox">
                <div>
                  <p
                    className={
                        orderDetails.paymentInfo &&
                        orderDetails.paymentInfo.status === "succeeded"
                        ? "greenColor"
                        : "redColor"
                    }
                  >
                    {orderDetails.paymentInfo &&
                    orderDetails.paymentInfo.status === "succeeded"
                      ? "PAID"
                      : "NOT PAID"}
                  </p>
                </div>

                <div>
                  <p>Amount:</p>
                  <span>{orderDetails.totalPrice && orderDetails.totalPrice}</span>
                </div>
              </div>

              <Typography>Order Status</Typography>
              <div className="orderDetailsContainerBox">
                <div>
                  <p
                    className={
                        orderDetails.orderStatus && orderDetails.orderStatus === "Delivered"
                        ? "greenColor"
                        : "redColor"
                    }
                  >
                    {orderDetails.orderStatus && orderDetails.orderStatus}
                  </p>
                </div>
              </div>
            </div>

            <div className="orderDetailsCartItems">
              <Typography>Order Items:</Typography>
              <div className="orderDetailsCartItemsContainer">
                {orderDetails.orderItems &&
                  orderDetails.orderItems.map((item) => (
                    <div key={item.productId}>
                      <img src={item.image} alt="Product" />
                      <Link to={`/product/${item.productId}`}>{item.name}</Link>{" "}
                      <span>
                        {item.quantity} X ₹{item.price} ={" "}
                        <b>₹{item.price * item.quantity}</b>
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default OrderDetails;
