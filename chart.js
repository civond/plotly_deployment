function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");

    // Use the list of sample names to populate the select options
    d3.json("samples.json").then((data) => {
        var sampleNames = data.names;

        sampleNames.forEach((sample) => {
            selector
                .append("option")
                .text(sample)
                .property("value", sample);
        });

        // Use the first sample from the list to build the initial plots
        var firstSample = sampleNames[0];
        buildCharts(firstSample);
        buildMetadata(firstSample);
    });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildMetadata(newSample);
    buildCharts(newSample);

}

// Demographics Panel 
function buildMetadata(sample) {
    d3.json("samples.json").then((data) => {
        var metadata = data.metadata;
        var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
        var result = resultArray[0];
        var PANEL = d3.select("#sample-metadata");
        PANEL.html("");
        Object.entries(result).forEach(([key, value]) => {
            PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
        });

    });
}

function buildCharts(sample) {
    d3.json("samples.json").then((data) => {
        var samples = data.samples;
        var resultArray = samples.filter(sampleObj => sampleObj.id == sample);
        var result = resultArray[0];

        //Get wfreq for gauge
        var metadata = data.metadata;
        var gaugeArray = metadata.filter(object => object.id == sample);
        var gaugeres = gaugeArray[0];

        var otu_ids = result.otu_ids;
        var otu_labels = result.otu_labels;
        var sample_values = result.sample_values;

        var topTenOTUs = otu_ids.slice(0, 10);
        var topTenValues = sample_values.slice(0, 10);
        var topTenOTU_names = otu_labels.slice(0, 10);

        var topTenSampleValues = topTenValues.map(sample => parseInt(sample)).reverse();

        var yticks = topTenOTUs.map(otu_id => 'OTU ' + otu_id);
        var barData = [{
            x: topTenSampleValues,
            y: yticks,
            text: topTenOTU_names,
            type: "bar",
            orientation: 'h'
        }];

        //var data = [barData];
        var barLayout = {
            title: "Top Ten Strains Found",
            xaxis: { title: "Sample Count" },
            yaxis: { title: "OTU IDs" }

        };
        Plotly.newPlot("bar-plot", barData, barLayout);

        //Bubble
        var bubbleData = {
            x: otu_ids,
            y: sample_values,
            text: otu_labels,
            mode: 'markers',
            marker: {
                size: sample_values,
                color: otu_ids,
                colorscale: 'Greens'
            }
        };
        data = [bubbleData]
        var bubbleLayout = {
            title: 'Bacteria Cultures Per Sample',
            showlegend: false,
            xaxis: { title: "OTU IDs" },
            yaxis: { title: "Count" }
        };
        Plotly.newPlot('bubble-plot', data, bubbleLayout);

        //Gauge
        var num_washes = gaugeres.wfreq


        var gaugeLayout = { width: 600, height: 500, margin: { t: 0, b: 0 } }

        var gaugeData = [{
            domain: { x: [0, 1], y: [0, 1] },
            value: num_washes,
            vmax: 10,
            title: { text: "Belly Button Washing Frequency </br></br><b>Scrubs Per Week</b>" },
            type: "indicator",

            mode: "gauge+number",
            gauge: {
                axis: { range: [0, 10] },
                bar: { color: "darkblue" },
                steps: [
                    { range: [0, 2], color: "red" },
                    { range: [2, 4], color: "orange" },
                    { range: [4, 6], color: "yellow" },
                    { range: [6, 8], color: "#86d19a" },
                    { range: [8, 10], color: "#18632c" }
                ],
            },
            bordercolor: "gray",
        }];

        var gaugeLayout = {
            width: 400,
            height: 400,
            margin: { t: 0, b: 0 },

        };


        Plotly.newPlot('gauge', gaugeData, gaugeLayout);
    });
}