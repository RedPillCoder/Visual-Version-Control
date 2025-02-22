document.addEventListener('DOMContentLoaded', function() {

    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    }

    const barSvg = d3.select("svg");
    const lineSvg = d3.select("#lineChart");
    const width = +barSvg.attr("width");
    const height = +barSvg.attr("height");

    let currentPage = 1;

    function drawBarChart(data) {
        barSvg.selectAll("*").remove(); // Clear previous chart

        const x = d3.scaleBand()
            .domain(data.map(d => d.version))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, data.length])
            .range([height, 0]);

        barSvg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        barSvg.append("g")
            .call(d3.axisLeft(y));

        barSvg.selectAll(".bar")
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
            .on("mouseout", function() {
                d3.select(this).attr("fill", "steelblue");
                d3.select("#tooltip").transition().duration(500).style("opacity", 0);
            })
            .on("click", function(event, d) {
                if (confirm(`Are you sure you want to delete version ${d.version}?`)) {
                    fetch(`/api/versions/${d.id}`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': getCsrfToken()
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            alert("Version deleted successfully!");
                            fetchVersions(); // Refresh the chart
                        } else {
                            alert("Error deleting version.");
                        }
                    });
                }
            });
    }

    function drawLineChart(data) {
        lineSvg.selectAll("*").remove(); // Clear previous chart

        const margin = {top: 20, right: 20, bottom: 30, left: 50};
        const width = +lineSvg.attr("width") - margin.left - margin.right;
        const height = +lineSvg.attr("height") - margin.top - margin.bottom;

        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        const line = d3.line()
            .x(d => x(new Date(d.date)))
            .y((d, i) => y(i));

        const g = lineSvg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        x.domain(d3.extent(data, d => new Date(d.date)));
        y.domain([0, data.length - 1]);

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        g.append("g")
            .call(d3.axisLeft(y));

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);
    }


    function fetchVersions(searchTerm = '') {
        const url = `/api/versions?page=${currentPage}&search=${encodeURIComponent(searchTerm)}`;
        fetch(url, {
            headers: {
                'X-CSRFToken': getCsrfToken()
            }
        })
            .then(response => response.json())
            .then(data => {
                drawBarChart(data.versions);
                drawLineChart(data.versions);
                updatePaginationControls(data);
            })
            .catch(error => console.error('Error fetching versions:', error));
    }

    function updatePaginationControls(data) {
        document.getElementById("prevPage").disabled = !data.has_prev;
        document.getElementById("nextPage").disabled = !data.has_next;
    }

    document.getElementById("nextPage").addEventListener("click", function() {
        currentPage++;
        fetchVersions();
    });

    document.getElementById("prevPage").addEventListener("click", function() {
        if (currentPage > 1) {
            currentPage--;
            fetchVersions();
        }
    });

    // Search functionality
    document.getElementById("searchForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const searchTerm = document.getElementById("search").value;
        fetchVersions(searchTerm);
    });

    document.getElementById("versionForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const version = document.getElementById("version").value;
        const date = document.getElementById("date").value;
        const changes = document.getElementById("changes").value;

        fetch('/api/versions', {
            headers: {
                'X-CSRFToken': getCsrfToken()
            }
        })
            .then(response => response.json())
            .then(data => {
                const exists = data.versions.some(v => v.version === version);
                if (exists) {
                    alert("Version already exists. Please choose a different version name.");
                    return;
                }
                const newVersion = { version, date, changes };

                console.log("New version data:", newVersion);
                fetch('/api/versions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'X-CSRFToken': getCsrfToken()
                    },
                    body: JSON.stringify(newVersion)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    alert("Version added successfully!");
                    fetchVersions(); // Refresh the charts
                    // Clear the form fields
                    document.getElementById("version").value = '';
                    document.getElementById("date").value = '';
                    document.getElementById("changes").value = '';
                })
                .catch(error => {
                    console.error('Error adding version:', error);
                    alert("Error adding version: " + error.message);
                });
            });
    });

    // Initial fetch of versions
    fetchVersions();
});
