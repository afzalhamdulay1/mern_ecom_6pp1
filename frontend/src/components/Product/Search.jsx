import React, { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import MetaData from "../layout/MetaData";
import "./Search.css";

const Search = () => {
  const [keyword, setKeyword] = useState(""); // Local state for the search keyword
  const navigate = useNavigate(); // Replacing history with useNavigate from React Router v6

  const searchSubmitHandler = (e) => {
    e.preventDefault();

    // Redirect based on the search keyword
    if (keyword.trim()) {
      navigate(`/products/${keyword}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <Fragment>
      <MetaData title="Search A Product -- ECOMMERCE" />
      <form className="searchBox" onSubmit={searchSubmitHandler}>
        <input
          type="text"
          placeholder="Search a Product ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)} // Update the keyword state
        />
        <input type="submit" value="Search" />
      </form>
    </Fragment>
  );
};

export default Search;
