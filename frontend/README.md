# Installation of the Frontend

Navigate to the `./frontend` folder and setup the `.env` file:

```
NEXT_PUBLIC_API_ENDPOINT=http://localhost:8000
NEXT_PUBLIC_FIREWORKS_API_KEY=<Your_FIREWORKS_api_key>
```
# Executing the Frontend without docker (optional)

Still on the `./frontend` folder, install the Node modules by running the following command:

```bash
npm install
```

Lastly, run the development server:

```bash
npm run dev
```

Once you have done everything, we can move on to the next part:
- [Executing the demo with docker](../) (not necessary if it was already done without docker )
- Or go back [to the main page](../)