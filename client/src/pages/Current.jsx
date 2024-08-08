import React, { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import SearchBox from "../components/SearchBox";
import SearchResults from "../components/SearchResults";
import StockTabs from "../components/StockTabs";
import StockTabsDivs from "../components/StockTabsDivs";
import M from "materialize-css";
import API from "../utils/API";

function Current() {
    const [stocks, setStocks] = useState([]);
    const [stockNames, setStockNames] = useState([]);
    const [formInput, setFormInput] = useState({ search: "" });
    const [stockChartXValues, setStockChartXValues] = useState([]);
    const [stockChartYValues, setStockChartYValues] = useState([]);
    const [stockData, setStockData] = useState([]);
    const { user } = useAuth0();

    useEffect(() => {
        loadStocks();

        return () => {
            const tabsElement = document.querySelector('.tabs');
            if (tabsElement) {
                const tabsInstance = M.Tabs.getInstance(tabsElement);
                if (tabsInstance) {
                    tabsInstance.destroy();
                }
            }
        };
    }, [user.sub]);

    const loadStocks = async () => {
        try {
            const res = await API.getStock({ user: user.sub, status: "current" });
            setStocks(res.data);
            setTimeout(() => {
                initTabs();
            }, 0);
        } catch (err) {
            console.error(err);
            M.toast({ html: "Failed to load stocks. Please try again later." });
        }
    };

    const initTabs = useCallback(() => {
        const tabsElement = document.querySelector('.tabs');
        if (tabsElement) {
            M.Tabs.init(tabsElement, { onShow: onTabShow });
            onTabShow();
        }
    }, []);

    const onTabShow = async () => {
        const activeTab = document.querySelector(".tabs .active");
        if (!activeTab) return;

        const stockSymbol = activeTab.innerHTML;
        if (!stockSymbol) return;

        try {
            const res = await API.getStockData(stockSymbol);
            const data = res.data;
            const stockChartXValuesList = [];
            const stockChartYValuesList = [];

            for (const key in data["Time Series (Daily)"]) {
                stockChartXValuesList.push(key);
                stockChartYValuesList.push(data["Time Series (Daily)"][key]["4. close"]);
            }

            setStockChartXValues(stockChartXValuesList);
            setStockChartYValues(stockChartYValuesList);
            setStockData(data);
        } catch (err) {
            console.error(err);
            M.toast({ html: `Failed to load data for ${stockSymbol}. Please try again later.` });
        }
    };

    const handleInputChange = (event) => {
        const { value } = event.target;
        setFormInput({ search: value });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        if (formInput.search) {
            try {
                const res = await API.getStockNames(formInput.search);
                setStockNames(res.data.bestMatches);
                setFormInput({ search: "" });
            } catch (err) {
                console.error(err);
                M.toast({ html: "Failed to fetch stock names. Please try again later." });
            }
        }
    };

    const handleStockSelection = async (event) => {
        event.preventDefault();
        const status = window.location.pathname.slice(1);
        const stockSymbol = event.target.dataset.value;
        const company = event.target.dataset.company;

        try {
            await API.saveStock({
                user: user.sub,
                symbol: stockSymbol,
                company: company,
                status: status
            });

            loadStocks();
            setStockNames([]);
            M.toast({ html: `Stock ${stockSymbol} has been saved!` });
        } catch (err) {
            console.error(err);
            M.toast({ html: `Failed to save stock ${stockSymbol}. Please try again later.` });
        }
    };

    const handleStockDelete = async (id) => {
        try {
            await API.deleteStock(id);
            loadStocks();
            M.toast({ html: "Stock has been deleted!" });
        } catch (err) {
            console.error(err);
            M.toast({ html: "Failed to delete stock. Please try again later." });
        }
    };

    const handleStockUpdate = async (event) => {
        event.preventDefault();
        const { id, value } = event.target;

        try {
            await API.updateStock(id, { status: value });
            loadStocks();
            M.toast({ html: `Stock has been moved to ${value}!` });
        } catch (err) {
            console.error(err);
            M.toast({ html: `Failed to update stock status. Please try again later.` });
        }
    };

    return (
        <div className="container">
            <h3 className="center-align">Stocks Currently Invested In</h3>
            <br />
            <div className="row">
                <div className="col s12 m6 card">
                    <SearchBox
                        onChange={handleInputChange}
                        name="search"
                        onClick={handleFormSubmit}
                        value={formInput.search}
                    />
                </div>
                <div className="col s12 m6">
                    <SearchResults
                        stockNames={stockNames}
                        onClick={handleStockSelection}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col s12">
                    <ul className="tabs tabs-fixed-width z-depth-1">
                        {stocks.length ? (
                            stocks.map(stock => (
                                <StockTabs key={stock._id} symbol={stock.symbol} />
                            ))
                        ) : (
                            <li className="tab"><strong>No Stocks Have Been Saved</strong></li>
                        )}
                    </ul>
                </div>
                {stocks.map(stock => (
                    <StockTabsDivs
                        key={stock._id}
                        symbol={stock.symbol}
                        company={stock.company}
                        status={stock.status}
                        id={stock._id}
                        newStatus={"interested"}
                        onClick={() => handleStockDelete(stock._id)}
                        onUpdate={handleStockUpdate}
                        xValues={stockChartXValues}
                        yValues={stockChartYValues}
                        stockData={stockData}
                    />
                ))}
            </div>
        </div>
    );
}

export default Current;