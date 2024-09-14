# Launch instructions

Follow these steps to set up and run the project:
# Move to the backend
1. Create a virtual environment:

    - **MacOS and Linux:**
        ```bash
        python3 -m venv venv
        ```
    - **Windows:**
        ```bash
        python -m venv venv
        ```

2. Activate the virtual environment:

    - **MacOS and Linux:**
        ```bash
        source venv/bin/activate
        ```
    - **Windows:**
        ```bash
        venv\Scripts\activate
        ```

**Note:** To deactivate the virtual environment:
    ```deactivate```

3. Install python dependecies:
    ```bash
    pip install -r requirements.txt
    ```

4. Install npm dependecies for the React frontend and build it:
    - **MacOS and Linux:**
        ```bash
        cd react-app/ && npm i && npm run build && cd ..
        ```
    - **Windows (PowerShell):**
        ```bash
        cd react-app/; if ($?) { npm i }; if ($?) { npm run build }; if ($?) { cd .. }
        ```

5. To run the server:
    ```bash
    python ./app.py
    ```
    ```
    flask --app app run
    ```

6. To run the whole thing:
```bash
    cd react-app/ && npm i && npm run build && cd .. && python3.12 backend/app.py
```