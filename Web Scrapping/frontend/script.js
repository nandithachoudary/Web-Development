document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const alumniTable = document.getElementById('alumni-table');
    const alumniData = document.getElementById('alumni-data');
    const alumniContainer = document.getElementById('alumni-container');
    const statusMessage = document.getElementById('status-message');
    const loader = document.getElementById('loader');
    const statsContainer = document.getElementById('stats-container');
    const totalCount = document.getElementById('total-count');
    const degreesCount = document.getElementById('degrees-count');
    const yearRange = document.getElementById('year-range');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const yearFilter = document.getElementById('year-filter');
    const degreeFilter = document.getElementById('degree-filter');
    const refreshDataBtn = document.getElementById('refresh-data');
    const downloadCsvBtn = document.getElementById('download-csv');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    // State variables
    let allAlumniData = [];
    let filteredData = [];
    let currentPage = 1;
    let itemsPerPage = 20;
    let currentSortField = 'name';
    let currentSortDirection = 'asc';
    let isLoading = false;
    let csvFilePath = 'alumni_data.csv'; // Default path to CSV file

    // Initialize the application
    init();

    // Event listeners
    searchButton.addEventListener('click', applyFilters);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            applyFilters();
        }
    });
    yearFilter.addEventListener('change', applyFilters);
    degreeFilter.addEventListener('change', applyFilters);
    refreshDataBtn.addEventListener('click', refreshData);
    downloadCsvBtn.addEventListener('click', downloadCSV);
    prevPageBtn.addEventListener('click', goToPreviousPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    
    // Add event listeners to sortable columns
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const sortField = th.getAttribute('data-sort');
            
            // If clicking the same column, toggle direction
            if (sortField === currentSortField) {
                currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortField = sortField;
                currentSortDirection = 'asc';
            }
            
            // Update visual indicators
            document.querySelectorAll('th[data-sort]').forEach(header => {
                header.removeAttribute('data-sort-direction');
            });
            th.setAttribute('data-sort-direction', currentSortDirection);
            
            // Sort and render
            sortData();
            renderTable();
        });
    });

    // Functions
    function init() {
        showLoading('Loading alumni data from CSV...');
        fetchCSVData();
    }

    function fetchCSVData() {
        isLoading = true;
        showLoading('Fetching alumni data from CSV...');
        
        
        fetch(csvFilePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch CSV file');
                }
                return response.text();
            })
            .then(csvText => {
                // Parse CSV data using Papa Parse
                parseCSVData(csvText);
            })
            .catch(error => {
                console.error('Error fetching CSV data:', error);
                showError('Error loading alumni data from CSV. Please check if the file exists.');
            })
            .finally(() => {
                isLoading = false;
                hideLoading();
            });
    }

    function parseCSVData(csvText) {
        // Use Papa Parse to parse CSV
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: function(results) {
                if (results.data && results.data.length > 0) {
                    processAlumniData(results.data);
                } else {
                    showError('No data found in the CSV file or invalid format.');
                }
            },
            error: function(error) {
                console.error('Error parsing CSV:', error);
                showError('Error parsing CSV data. Check the file format.');
            }
        });
    }

    function processAlumniData(data) {
        if (data.length === 0) {
            showError('No alumni data available in the CSV file.');
            return;
        }
        
        // Store the alumni data
        allAlumniData = data.map((item, index) => ({
            id: index + 1,
            name: item.name || item.Name || 'Unknown',
            year: item.year || item.Year || item.gradYear || item['Graduation Year'] || 'Unknown',
            degree: item.degree || item.Degree || 'Unknown'
        }));
        
        // Initialize filters
        initializeFilters();
        
        // Apply initial sort
        filteredData = [...allAlumniData];
        sortData();
        
        // Calculate stats
        updateStats();
        
        // Render the table
        renderTable();
        
        // Show components that were hidden
        statsContainer.style.display = 'flex';
        alumniContainer.style.display = 'block';
        
        // Show success message
        statusMessage.textContent = `Successfully loaded ${allAlumniData.length} alumni records from CSV`;
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 5000);
    }

    function initializeFilters() {
        // Clear existing options (keep the first "All" option)
        while (yearFilter.options.length > 1) {
            yearFilter.remove(1);
        }
        
        while (degreeFilter.options.length > 1) {
            degreeFilter.remove(1);
        }
        
        // Extract unique years and degrees
        const years = new Set();
        const degrees = new Set();
        
        allAlumniData.forEach(item => {
            if (item.year && item.year !== 'Unknown') years.add(item.year);
            if (item.degree && item.degree !== 'Unknown') degrees.add(item.degree);
        });
        
        // Sort years and degrees
        const sortedYears = Array.from(years).sort((a, b) => {
            // Try to sort numerically first (for years like "2020")
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) return numB - numA; // Most recent first
            
            // Fall back to string comparison
            return a.localeCompare(b);
        });
        
        const sortedDegrees = Array.from(degrees).sort();
        
        // Add options
        sortedYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
        
        sortedDegrees.forEach(degree => {
            const option = document.createElement('option');
            option.value = degree;
            option.textContent = degree;
            degreeFilter.appendChild(option);
        });
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const yearValue = yearFilter.value;
        const degreeValue = degreeFilter.value;
        
        filteredData = allAlumniData.filter(item => {
            // Search term filter
            const matchesSearch = !searchTerm || 
                item.name.toLowerCase().includes(searchTerm) || 
                item.year.toString().toLowerCase().includes(searchTerm) || 
                item.degree.toLowerCase().includes(searchTerm);
            
            // Year filter
            const matchesYear = !yearValue || item.year.toString() === yearValue;
            
            // Degree filter
            const matchesDegree = !degreeValue || item.degree === degreeValue;
            
            return matchesSearch && matchesYear && matchesDegree;
        });
        
        // Reset to first page
        currentPage = 1;
        
        // Apply current sort
        sortData();
        
        // Update stats and render
        updateStats();
        renderTable();
    }

    function sortData() {
        filteredData.sort((a, b) => {
            let valueA = a[currentSortField];
            let valueB = b[currentSortField];
            
            // Handle numeric comparison for years
            if (currentSortField === 'year') {
                const numA = parseInt(valueA);
                const numB = parseInt(valueB);
                
                if (!isNaN(numA) && !isNaN(numB)) {
                    return currentSortDirection === 'asc' ? numA - numB : numB - numA;
                }
            }
            
            // String comparison
            if (valueA < valueB) return currentSortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return currentSortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    function renderTable() {
        // Clear existing rows
        alumniData.innerHTML = '';
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
        const pageCount = Math.ceil(filteredData.length / itemsPerPage);
        
        // Update pagination controls
        pageInfo.textContent = `Page ${currentPage} of ${pageCount}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage >= pageCount;
        
        // Check if we have data to display
        if (filteredData.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 3;
            emptyCell.className = 'empty-state';
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-search';
            
            const message = document.createElement('p');
            message.textContent = 'No alumni found matching your criteria';
            
            emptyCell.appendChild(icon);
            emptyCell.appendChild(message);
            emptyRow.appendChild(emptyCell);
            alumniData.appendChild(emptyRow);
            return;
        }
        
        // Display the current page of data
        for (let i = startIndex; i < endIndex; i++) {
            const alumni = filteredData[i];
            const row = document.createElement('tr');
            
            // Name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = alumni.name;
            row.appendChild(nameCell);
            
            // Year cell
            const yearCell = document.createElement('td');
            yearCell.textContent = alumni.year;
            row.appendChild(yearCell);
            
            // Degree cell
            const degreeCell = document.createElement('td');
            degreeCell.textContent = alumni.degree;
            row.appendChild(degreeCell);
            
            alumniData.appendChild(row);
        }
    }

    function updateStats() {
        totalCount.textContent = filteredData.length;
        
        // Calculate unique degrees
        const uniqueDegrees = new Set();
        filteredData.forEach(item => {
            if (item.degree && item.degree !== 'Unknown') uniqueDegrees.add(item.degree);
        });
        degreesCount.textContent = uniqueDegrees.size;
        
        // Calculate year range
        const years = filteredData
            .map(item => parseInt(item.year))
            .filter(year => !isNaN(year));
        
        if (years.length > 0) {
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);
            yearRange.textContent = minYear === maxYear ? minYear : `${minYear} - ${maxYear}`;
        } else {
            yearRange.textContent = 'N/A';
        }
    }

    function goToPreviousPage() {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            window.scrollTo({ top: alumniTable.offsetTop - 50, behavior: 'smooth' });
        }
    }

    function goToNextPage() {
        const pageCount = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage < pageCount) {
            currentPage++;
            renderTable();
            window.scrollTo({ top: alumniTable.offsetTop - 50, behavior: 'smooth' });
        }
    }

    function refreshData() {
        if (isLoading) return;
        
        showLoading('Refreshing alumni data...');
        
        // For CSV implementation, we simply reload the file
        fetchCSVData();
    }

    function downloadCSV() {
        // Simply download the existing CSV file
        window.location.href = csvFilePath;
    }

    function showLoading(message) {
        statusMessage.textContent = message || 'Loading...';
        loader.style.display = 'block';
    }

    function hideLoading() {
        loader.style.display = 'none';
    }

    function showError(message) {
        statusMessage.textContent = message;
        statusMessage.style.color = '#ef4444';
        
        setTimeout(() => {
            statusMessage.style.color = ''; // Reset to default
        }, 5000);
    }
});
