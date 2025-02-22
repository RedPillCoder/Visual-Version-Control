# Visual Version Control System

This project is a visual version control system that allows users to easily track changes to code through interactive graphs and timelines on GitHub. It provides a user-friendly interface for managing and visualizing version history.

## Features

- Add new versions with version number, date, and change description
- View version history in an interactive bar chart
- Visualize version progression in a line chart
- Search functionality to filter versions
- Pagination for better performance with large datasets
- Delete versions directly from the chart

## Technologies Used

- Backend: Flask (Python)
- Frontend: HTML, CSS, JavaScript
- Database: SQLite with SQLAlchemy ORM
- Visualization: D3.js
- Styling: Bootstrap

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/visual_version_control.git
   cd visual_version_control
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the Flask application:
   ```
   python app.py
   ```

5. Open your web browser and navigate to `http://localhost:5000` to use the application.

## Usage

- To add a new version, fill out the form at the top of the page with the version number, date, and changes, then click "Add Version".
- Use the search bar to filter versions based on version number or change description.
- Click on a bar in the chart to view details about that version.
- To delete a version, click on its bar in the chart and confirm the deletion.
- Use the pagination controls at the bottom to navigate through the version history.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
