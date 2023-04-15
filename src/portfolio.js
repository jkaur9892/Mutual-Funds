import React, { useState, useEffect, useCallback} from "react";
import axios from "axios";
import "./App.css";

const MutualFund = () => {
  const [funds, setFunds] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetails, setShowDetails] = useState(false);

   const handleSearch = useCallback(() => {
    // Fetching funds based on search query
    axios
      .get(`https://api.mfapi.in/mf/search?q=${searchQuery}`)
      .then((response) => {
        setFunds(response.data);
      })
      .catch((error) => {
        console.error("Failed to search mutual funds:", error);
      });
  }, [searchQuery]); 

  useEffect(() => {
    
    let timerId;

    const debouncedHandleSearch = () => {
      clearTimeout(timerId);

      timerId = setTimeout(() => {
        handleSearch();
      }, 300); 
    };
    debouncedHandleSearch();

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery, handleSearch]);

  const handleFundSelect = (fund) => {
    // Adding selected fund to the portfolio
    const existingFund = portfolio.find(
      (pf) => pf.schemeCode === fund.schemeCode
    );
    if (existingFund) {
      const updatedPortfolio = portfolio.map((pf) => {
        if (pf.schemeCode === fund.schemeCode) {
          return { ...pf, units: pf.units + 1 };
        }
        return pf;
      });
      setPortfolio(updatedPortfolio);
    } else {
      setPortfolio([...portfolio, { ...fund, units: 1 }]);
    }
  };

  const handleUnitsChange = (schemeCode, units) => {
    // Updating units for a fund in the portfolio
    const updatedPortfolio = portfolio.map((pf) => {
      if (pf.schemeCode === schemeCode) {
        return { ...pf, units };
      }
      return pf;
    });
    setPortfolio(updatedPortfolio);
  };

  const handleFundClick = (fund) => {
    // Showing details popup for a fund
    axios
      .get(`https://api.mfapi.in/mf/${fund.schemeCode}`)
      .then((response) => {
        console.log(response.data);
        setSelectedFund(response);
      })
      .catch((error) => {
        console.error("Failed to search mutual funds:", error);
      });
    // setSelectedFund(fund);
    setShowDetails(true);
  };

  const handleRemoveFromPortfolio = (schemeCode) => {
    // Filter out the fund from the portfolio
    const updatedPortfolio = portfolio.filter(
      (pf) => pf.schemeCode !== schemeCode
    );
    setPortfolio(updatedPortfolio);
    setShowDetails(false);
  };

  const getTotalUnits = () => {
    let totalUnits = 0;

    portfolio.forEach((pf) => {
      totalUnits += Number(pf.units);
    });

    return totalUnits;
  };

  return (
    <div style={{ backgroundColor: "#fbfcfd" }}>
      <h1>Mutual Fund Portfolio</h1>
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Mutual Funds"
          className="search"
        />
        <button onClick={handleSearch} className="searchbtn">
          Search
        </button>
      </div>
      <div>
        <br />
        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          {funds.map((fund, index) => (
            <div
              style={{
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
              }}
              key={fund.schemeCode + index}
            >
              {fund.schemeName}
              <button
                className="addtolistbtn"
                onClick={() => handleFundSelect(fund)}
              >
                Add to Portfolio
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2>MY PORTFOLIO LIST</h2>
        <ul>
          {portfolio.map((pf, index) => (
            <li key={pf.schemeCode + index}>
              <div
                className="portfolio-item"
                style={{
                  backgroundColor: "rgb(230 235 241)",
                  padding: "10px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{pf.schemeName}</span>
                <span>
                  <strong>Units: {pf.units}</strong>
                </span>
                <button
                  className="detailbtn"
                  onClick={() => handleFundClick(pf)}
                >
                  Details
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "20px",
          }}
        >
          <span>
            <strong>Total Units: </strong>
          </span>
          <span>
            <strong>{getTotalUnits()} Unit</strong>{" "}
          </span>
        </div>
        {showDetails && selectedFund && (
          <div>
            <div
              className="detail-popup"
              style={{
                backgroundColor: "#rgb(174 202 230)",
                padding: "10px",
                marginBottom: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Mutual Fund Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    marginLeft: "50px",
                    marginBottom: "30px",
                  }}
                >
                  <span>&times;</span>
                </button>
              </div>

              <p>
                <strong>Scheme Name:</strong>
                {selectedFund.data.meta.scheme_name}
              </p>
              <p>
                <strong>Fund House:</strong> {selectedFund.data.meta.fund_house}
              </p>
              <p>
                <strong>Scheme Category:</strong>
                {selectedFund.data.meta.scheme_category}
              </p>
              <p>
                <strong>Scheme Type:</strong>
                {selectedFund.data.meta.scheme_type}
              </p>
              <p>
                <strong>Latest NAV:</strong> {selectedFund.data.data[0].nav}
              </p>
              <p>
                <strong>Latest NAV Date:</strong>
                {selectedFund.data.data[0].date}
              </p>
              <ul>
                {portfolio.map(
                  (pf, index) =>
                    pf.schemeCode === selectedFund.data.meta.scheme_code && (
                      <li key={pf.schemeCode + index}>
                        <div className="detail-popup-buttons">
                          <div>
                            <strong>{pf.units}Units</strong>
                          </div>
                          {pf.units > 0 ? (
                            <>
                              <button
                                className="detailbtn"
                                onClick={() =>
                                  handleUnitsChange(pf.schemeCode, pf.units + 1)
                                }
                              >
                                BUY
                              </button>
                              <button
                                className="detailbtn"
                                onClick={() =>
                                  handleUnitsChange(pf.schemeCode, pf.units - 1)
                                }
                              >
                                SELL
                              </button>
                            </>
                          ) : (
                            <button
                              className="detailbtn"
                              onClick={() =>
                                handleRemoveFromPortfolio(pf.schemeCode)
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </li>
                    )
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MutualFund;
