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

1. **Backend**:
   - Flask (Python): Web framework for the backend
   - Flask-SQLAlchemy: ORM for database operations
   - Flask-Login: For user authentication and session management
   - Flask-WTF: For CSRF protection
   - Flask-Limiter: For rate limiting API endpoints
   - bcrypt: For password hashing

2. **Frontend**:
   - HTML5: For structuring the web pages
   - CSS3: For styling, including custom styles
   - JavaScript (ES6+): For client-side interactions and AJAX requests
   - D3.js: For creating interactive data visualizations (bar chart and line chart)

3. **Database**:
   - SQLite: Lightweight, serverless database
   - SQLAlchemy ORM: For object-relational mapping and database operations

4. **Visualization**:
   - D3.js: For creating interactive bar charts and line charts

5. **Styling**:
   - Bootstrap 4.5.2: For responsive design and pre-styled components

6. **Security**:
   - CSRF Protection: Using Flask-WTF
   - Password Hashing: Using bcrypt
   - Rate Limiting: Using Flask-Limiter

7. **Version Control**:
   - Git: Assumed to be used for version control
   - GitHub: For hosting the repository and potentially for deployment

8. **Development Tools**:
   - pip: For Python package management
   - Web Browser Developer Tools: For debugging and testing


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
