========================================
FAMILY KITCHEN HUB - INSTALLATION GUIDE
========================================

I. FRONT-END:
-------------
1. Install dependencies:
   npm i

2. Run the application:
   npm run dev


II. BACK-END:
-------------
Prerequisites:
- Java Development Kit (JDK): Version 17 or higher
- Gradle: Included in the project (gradlew)

Setup:
1. Configure Database:
   - Open file: FamilyKitchenHub/src/main/resources/application.properties
   - Update MySQL connection settings (url, username, password)
   - Create database: familyKitchenHub

2. Install dependencies:
   ./gradlew build

3. Run the application:
   - In IntelliJ: Click the Run ▶️ button on the main() method
   - Or run command: ./gradlew bootRun


III. PYTHON AI SERVICE:
-----------------------
Prerequisites:
- Python 3.x
- Flask and Flask-CORS

Setup:
1. Install libraries:
   pip install flask flask-cors

2. Run the service:
   cd "Recommended dishes"
   python main.py
   
   Service will run at: http://localhost:5001


========================================
NOTES:
- Frontend runs on Vite default port (usually 5173)
- Backend Spring Boot runs on default port (usually 8080)
- Python AI Service runs on port 5001
- Ensure MySQL is installed and running before starting the Backend
========================================
