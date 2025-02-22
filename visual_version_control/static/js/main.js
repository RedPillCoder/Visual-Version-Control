document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/versions')
        .then(response => response.json())
        .then(data => {
            const svg = d3.select("svg");
            const width = +svg.attr("width");
            const height = +svg.attr("height");

            const x = d3.scaleBand()
                .domain(data.map(d => d.version))
                .range([0, width])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, data.length])
                .range([height, 0]);

            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            svg.append("g")
                .call(d3.axisLeft(y));

            svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.version))
                .attr("y", (d, i) => y(i + 1))
                .attr("width", x.bandwidth())
                .attr("height", (d, i) => height - y(i + 1))
                .attr("fill", "steelblue");
        });
});
