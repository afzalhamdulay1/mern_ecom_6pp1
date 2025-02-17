import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../Layout/MetaData";
import Loader from "../Layout/Loader/Loader";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";
import { loadUser, resetUpdateProfile } from "../../features/user/userSlice";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated, isUpdated  } = useSelector((state) => state.user);

  useEffect(() => {

    // if (!user) {
    //   // Load user data if not already loaded
    //   dispatch(loadUser());
    // }

    if (isUpdated) {
      // Reload user data if the profile was updated
      dispatch(loadUser());
      dispatch(resetUpdateProfile()); // Reset the isUpdated flag
    }

    // if (isAuthenticated === false) {
    //   navigate("/login");
    // }
  }, [ dispatch, isUpdated]);
  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={`${user?.name}'s Profile`} />
          <div className="profileContainer">
            <div>
              <h1>My Profile</h1>
              <img src={user.avatar?.url ? user.avatar?.url : "./images/Profile.png"} alt={user.name} />
              <Link to="/me/update">Edit Profile</Link>
            </div>
            <div>
              <div>
                <h4>Full Name</h4>
                <p>{user?.name}</p>
              </div>
              <div>
                <h4>Email</h4>
                <p>{user.email}</p>
              </div>
              <div>
                <h4>Joined On</h4>
                <p>{String(user.createdAt).substr(0, 10)}</p>
              </div>

              <div>
                <Link to="/orders">My Orders</Link>
                <Link to="/password/update">Change Password</Link>
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Profile;
