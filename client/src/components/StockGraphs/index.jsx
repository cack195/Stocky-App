import Plot from "react-plotly.js";

function StockGraphs(props) {
  return (
    <div id="data-graph">
      <Plot
        data={[
          {
            x: props.xValues,
            y: props.yValues,
            type: "scatter",
            mode: "lines+markers",
            marker: { color: "blue" },
          },
        ]}
        layout={{ width: 1000, height: 540 }}
      />
    </div>
  );
}

export default StockGraphs;
