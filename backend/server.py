from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, date
import base64


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Memory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    memory_date: str  # Date when the memory happened
    image_data: Optional[str] = None  # Base64 encoded image
    tags: List[str] = []
    couple_name1: str
    couple_name2: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MemoryCreate(BaseModel):
    title: str
    description: str
    memory_date: str
    image_data: Optional[str] = None
    tags: List[str] = []
    couple_name1: str
    couple_name2: str

class MemoryResponse(BaseModel):
    id: str
    title: str
    description: str
    memory_date: str
    image_data: Optional[str] = None
    tags: List[str]
    couple_name1: str
    couple_name2: str
    created_at: datetime

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Couple's Memory Storage API"}

@api_router.post("/memories", response_model=MemoryResponse)
async def create_memory(memory_input: MemoryCreate):
    try:
        memory_dict = memory_input.dict()
        memory_obj = Memory(**memory_dict)
        
        # Insert into database
        result = await db.memories.insert_one(memory_obj.dict())
        
        if result.inserted_id:
            return MemoryResponse(**memory_obj.dict())
        else:
            raise HTTPException(status_code=500, detail="Failed to create memory")
            
    except Exception as e:
        logging.error(f"Error creating memory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/memories", response_model=List[MemoryResponse])
async def get_memories():
    try:
        # Get all memories sorted by memory_date (most recent first)
        memories = await db.memories.find().sort("memory_date", -1).to_list(1000)
        return [MemoryResponse(**memory) for memory in memories]
    except Exception as e:
        logging.error(f"Error fetching memories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/memories/{memory_id}", response_model=MemoryResponse)
async def get_memory(memory_id: str):
    try:
        memory = await db.memories.find_one({"id": memory_id})
        if memory:
            return MemoryResponse(**memory)
        else:
            raise HTTPException(status_code=404, detail="Memory not found")
    except Exception as e:
        logging.error(f"Error fetching memory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.delete("/memories/{memory_id}")
async def delete_memory(memory_id: str):
    try:
        result = await db.memories.delete_one({"id": memory_id})
        if result.deleted_count == 1:
            return {"message": "Memory deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Memory not found")
    except Exception as e:
        logging.error(f"Error deleting memory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/memories/couple/{couple1}/{couple2}", response_model=List[MemoryResponse])
async def get_memories_by_couple(couple1: str, couple2: str):
    try:
        # Find memories for the specific couple (either order)
        memories = await db.memories.find({
            "$or": [
                {"couple_name1": couple1, "couple_name2": couple2},
                {"couple_name1": couple2, "couple_name2": couple1}
            ]
        }).sort("memory_date", -1).to_list(1000)
        return [MemoryResponse(**memory) for memory in memories]
    except Exception as e:
        logging.error(f"Error fetching couple memories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()