from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = [
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/test")
async def test():
    """Returns sample tabular data for Table component"""
    return {
        "columns": [
            {"key": "id", "label": "ID"},
            {"key": "name", "label": "Name"},
            {"key": "email", "label": "Email"},
            {"key": "role", "label": "Role"},
            {"key": "status", "label": "Status"}
        ],
        "data": [
            {"id": "1", "name": "Alice Johnson", "email": "alice@example.com", "role": "Admin", "status": "Active"},
            {"id": "2", "name": "Bob Smith", "email": "bob@example.com", "role": "Developer", "status": "Active"},
            {"id": "3", "name": "Carol White", "email": "carol@example.com", "role": "Designer", "status": "Away"},
            {"id": "4", "name": "David Brown", "email": "david@example.com", "role": "Manager", "status": "Active"},
            {"id": "5", "name": "Eve Davis", "email": "eve@example.com", "role": "Developer", "status": "Active"},
            {"id": "6", "name": "Frank Miller", "email": "frank@example.com", "role": "QA Engineer", "status": "Inactive"},
            {"id": "7", "name": "Grace Lee", "email": "grace@example.com", "role": "Developer", "status": "Active"},
            {"id": "8", "name": "Henry Wilson", "email": "henry@example.com", "role": "Designer", "status": "Active"},
        ]
    }