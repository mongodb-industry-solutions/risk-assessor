# Seting up the Dataset

Clone the repo:
```
git clone git@github.com:mongodb-industry-solutions/Risk-assessor.git
```

- [Connect to your cluster](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/)
- Create the "ESG_demo" database and the "Flood_geospatial" collection
- Uncompress the file ESG_demo.Flood_geospatial.csv.zip
- [import the CSV file on the above collection (we recomend using MongoDB Compass)](https://www.mongodb.com/docs/compass/current/import-export/)
- [Lastly create a Geospatial Indexes on the "COORD" field](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/indexes/geospatial-index/)

> [!Note]
> The flood data that is used in this demo comes from this [United States Flood Database](https://zenodo.org/records/7545697). It was just refined to be able to use a "COORD_2dsphere" index and to exclude older data so as to reduce the overall size of the dataset.

# Installation of the Backend

Navigate to the `/backend` folder and setup the `.env` file:
```
MONGODB_CONNECTION_STRING=
GOOGLE_API_KEY=
MONGODB_DB=ESG_demo
MONGODB_COL=Flood_geospatial 
```

## Run it Locally

### Setup virtual environment with Poetry

1. (Optional) Set your project description and author information in the `pyproject.toml` file:
   ```toml
   description = "Your Description"
   authors = ["Your Name <you@example.com>"]
2. Open the project in your preferred IDE.
3. Open a Terminal window.
4. Ensure you are in the root project directory where the `makefile` is located.
5. Execute the following commands:
  - Poetry start
    ````bash
    make poetry_start
    ````
  - Poetry install
    ````bash
    make poetry_install
    ````
6. Verify that the `.venv` folder has been generated within the `/backend` directory.

### Run the Backend

1. To run the backend, execute the following command:
    ````bash
    poetry run uvicorn main:app --host 0.0.0.0 --port 8080
    ````

> **_Note:_** Notice that the backend is running on port `8080`. You can change this port by modifying the `--port` flag.

Once this is running you should have 3 APIs that are running:
- `http://localhost:8080/rev_geocode?latitude=${e.latlng.lat}&longitude=${e.latlng.lng}`
- `http://localhost:8080/address/`
- `http://localhost:8080/coordinates?latitude=${coords.lat}&longitude=${coords.lng}`

Once you have done everything, we can move on to the next part:
- [Installation of the frontend](../frontend/)
- Or go back [to the main page](../)
