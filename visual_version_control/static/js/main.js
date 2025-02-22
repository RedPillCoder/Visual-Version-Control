document.addEventListener('DOMContentLoaded', function() {
    const svg = d3.select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    function drawBarChart(data) {
        svg.selectAll("*").remove(); // Clear previous chart

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
            .attr("fill", "steelblue")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "orange");
                const tooltip = d3.select("#tooltip");
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Version: ${d.version}<br>Date: ${d.date}<br>Changes: ${d.changes}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("fill", "steelblue");
                d3.select("#tooltip").transition().duration(500).style("opacity", 0);
            })
            .on("click", function(event, d) {
                if (confirm(`Are you sure you want to delete version ${d.version}?`)) {
                    fetch(`/api/versions/${d.id}`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (response.ok) {
                            fetchVersions(); // Refresh the chart
                        } else {
                            alert("Error deleting version.");
                        }
                    });
                }
            });
    }

    function drawLineChart(data) {
        const lineSvg = d3.select("#lineChart");
        lineSvg.selectAll("*").remove(); // Clear previous chart

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.date)))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.version)])
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(new Date(d.date)))
            .y((d, i) => y(i + 1));

        lineSvg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        lineSvg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        lineSvg.append("g")
            .call(d3.axisLeft(y));
    }

    function fetchVersions() {
        fetch('/api/versions')
            .then(response => response.json())
            .then(data => {
                drawBarChart(data);
                drawLineChart(data);
            })
            .catch(error => console.error('Error fetching versions:', error));
    }

    // Search functionality
    document.getElementById("searchForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const searchTerm = document.getElementById("search").value.toLowerCase();
        fetch('/api/versions')
            .then(response => response.json())
            .then(data => {
                const filteredData = data.filter(version => 
                    version.version.toLowerCase().includes(searchTerm) || 
                    version.changes.toLowerCase().includes(searchTerm)
                );
                drawBarChart(filteredData);
                drawLineChart(filteredData);
            })
            .catch(error => console.error('Error fetching versions:', error));
    });

    // Form submission for adding new versions
    document.getElementById("versionForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const version = document.getElementById("version").value;
        const date = document.getElementById("date").value;
        const changes = document.getElementById("changes").value;

        const newVersion = { version, date, changes };
        fetch('/api/versions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newVersion)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error adding version');
            }
        })
        .then(() => {
            fetchVersions(); // Refresh the chart
            // Clear the form fields
            document.getElementById("version").value = '';
            document.getElementById("date").value = '';
            document.getElementById("changes").value = '';
        })
        .catch(error => {
            alert(error.message);
        });
    });

    // Initial fetch of versions
    fetchVersions();
});
           
