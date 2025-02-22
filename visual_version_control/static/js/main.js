document.addEventListener('DOMContentLoaded', function() {
    const svg = d3.select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    let currentPage = 1;

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
                            alert("Version deleted successfully!");
                            fetchVersions(); // Refresh the chart
                        } else {
                            alert("Error deleting version.");
                        }
                    });
                }
            });
    }

    function fetchVersions(searchTerm = '') {
        const url = `/api/versions?page=${currentPage}&search=${encodeURIComponent(searchTerm)}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                drawBarChart(data.versions);
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

    // Form submission for adding new versions
    document.getElementById("versionForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const version = document.getElementById("version").value;
        const date = document.getElementById("date").value;
        const changes = document.getElementById("changes").value;

        // Check if version already exists
        fetch('/api/versions')
            .then(response => response.json())
            .then(data => {
                const exists = data.versions.some(v => v.version === version);
                if (exists) {
                    alert("Version already exists. Please choose a different version name.");
                    return;
                }
                const newVersion = { version, date, changes };
                console.log("New version data:", newVersion); // Log the data being sent
                fetch('/api/versions', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json; charset=utf-8' // Fixed Content-Type header
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
                    fetchVersions(); // Refresh the chart
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
