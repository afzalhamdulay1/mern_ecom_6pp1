import { Fragment, useEffect } from "react";
import "./OrderDetails.css";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../Layout/MetaData";
import { Link, useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import { getOrderDetails, clearErrors } from "../../features/order/orderSlice";
import Loader from "../Layout/Loader/Loader";
import { toast } from "react-toastify";

const OrderDetails = () => {
  const { id } = useParams();
  const { orderDetails, error, loading } = useSelector(
    (state) => state.newOrder
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    dispatch(getOrderDetails(id));
  }, [dispatch, id, error]);

  if (loading) return <Loader />;

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
              <div className="orderDetailsSection">
                <Typography variant="h1" className="orderTitle">Order #{orderDetails?._id}</Typography>
                <Typography variant="h6">Shipping Info</Typography>
                <div className="orderDetailsContainerBox">
                  <div>
                    <p>Name:</p>
                    <span>{orderDetails.user && orderDetails.user.name}</span>
                  </div>
                  <div>
                    <p>Phone:</p>
                    <span>{orderDetails.shippingInfo && orderDetails.shippingInfo.phoneNo}</span>
                  </div>
                  <div>
                    <p>Address:</p>
                    <span>{orderDetails.shippingInfo && `${orderDetails.shippingInfo.address}, ${orderDetails.shippingInfo.city}, ${orderDetails.shippingInfo.state}, ${orderDetails.shippingInfo.pinCode}, ${orderDetails.shippingInfo.country}`}</span>
                  </div>
                </div>
                <Typography variant="h6">Payment</Typography>
                <div className="orderDetailsContainerBox">
                  <div>
                    <p className={orderDetails.paymentInfo?.status === "succeeded" ? "greenColor" : "redColor"}>
                      {orderDetails.paymentInfo?.status === "succeeded" ? "PAID" : "NOT PAID"}
                    </p>
                  </div>
                  <div>
                    <p>Amount:</p>
                    <span>₹{orderDetails.totalPrice}</span>
                  </div>
                </div>
                <Typography variant="h6">Order Status</Typography>
                <div className="orderDetailsContainerBox">
                  <div>
                    <p className={orderDetails.orderStatus === "Delivered" ? "greenColor" : "redColor"}>
                      {orderDetails.orderStatus}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="orderDetailsSection">
              <Typography variant="h6">Order Items:</Typography>
              <div className="orderDetailsCartItemsContainer">
                {orderDetails.orderItems &&
                  orderDetails.orderItems.map((item) => (
                    <div key={item.product}>
                      <img src={item.image} alt={item.name} />
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                      <span>
                        {item.quantity} × ₹{item.price} = <b>₹{item.price * item.quantity}</b>
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
