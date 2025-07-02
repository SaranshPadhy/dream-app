import sqlite3, json
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional
from schema import DreamSchema
from database import get_db, init_db

async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React’s dev server
    allow_credentials=True,
    allow_methods=["*"],                      
    allow_headers=["*"],
)

@app.get("/dreams/by-emotion/{emotion_filter}")
def get_dream_by_emotion(emotion_filter: str, db: sqlite3.Connection = Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT DISTINCT
                dreams.*
            FROM
                emotions
                INNER JOIN dreams ON emotions.dream_id = dreams.id
            WHERE
                emotions.emotion = ?
            """,
            (emotion_filter,),
        )
        matching_dreams = cursor.fetchall()

        if not matching_dreams:
            raise HTTPException(status_code=404, detail="No dreams found with that emotion")

        matching_dreams_dict_list = []
        for row in matching_dreams:
            matching_dreams_dict_list.append(dict(row))

        return matching_dreams_dict_list

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@app.get("/dreams/{id}")
def get_dream_by_id(id: int, db: sqlite3.Connection = Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT * FROM dreams WHERE id=?
        """, (id,))
        dream_data = cursor.fetchone()
        
        if dream_data is None:
            raise HTTPException(status_code=404, detail="Dream not found")
        dream_data = dict(dream_data)

        cursor.execute("SELECT emotion FROM emotions WHERE dream_id = ?", (id,))
        emotion_data = cursor.fetchall()

        emotion_list = []
        for row in emotion_data:
            emotion_list.append(row["emotion"])
    
        dream_data['emotions'] = emotion_list

        return dream_data
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@app.delete("/dreams/{id}")
def delete_dream(id: int, db: sqlite3.Connection = Depends(get_db)):
    try:
        with db as conn:
            cursor = conn.cursor()
            cursor.execute("""
                DELETE FROM dreams WHERE id=? RETURNING *
            """, (id,))
            deleted_dream = cursor.fetchone()

            if deleted_dream is None:
                raise HTTPException(status_code=404, detail="Dream not found with that ID")

            return dict(deleted_dream)
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@app.put("/dreams/{id}")
def update_dream(id: int, dream: DreamSchema, db: sqlite3.Connection = Depends(get_db)):
    try:
        with db as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM dreams WHERE id=?", (id,))
            
            row = cursor.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Dream not found with that ID")
            
            cursor.execute("""
                UPDATE dreams SET name=?, description=?, dream_date=?, lucidity=?, sleep_duration=?, recurring=?, room_temp=?, stress_before_sleep=? WHERE id=?
            """, (dream.name, dream.description, dream.dream_date, dream.lucidity, dream.sleep_duration, dream.recurring, dream.room_temp, dream.stress_before_sleep, id))

            dream_data = dict(row)

            cursor.execute("DELETE FROM emotions WHERE dream_id=?", (id,))

            for individual_emotion in dream.emotions:
                cursor.execute("INSERT INTO emotions (dream_id, emotion) VALUES (?, ?)", (id, individual_emotion))
            cursor.execute("SELECT emotion FROM emotions WHERE dream_id = ?", (id,))
            emotion_data = cursor.fetchall()

            emotion_list = []
            for row in emotion_data:
                emotion_list.append(row["emotion"])
        
            dream_data['emotions'] = emotion_list
            return dream_data
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
            



@app.post("/dreams")
def add_dream(dream: DreamSchema, db: sqlite3.Connection = Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO dreams (name, description, dream_date, lucidity, sleep_duration, recurring, room_temp, stress_before_sleep) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (dream.name, dream.description, dream.dream_date, dream.lucidity, dream.sleep_duration, dream.recurring, dream.room_temp, dream.stress_before_sleep)
        )
        dream_no = cursor.lastrowid

        cursor.execute("SELECT * FROM dreams WHERE id = ?", (dream_no,))
        dream_data = cursor.fetchone()

        if dream_data is None:
            raise HTTPException(status_code=404, detail="Dream not found after insertion")
        
        dream_data = dict(dream_data)
        for individual_emotion in dream.emotions:
            cursor.execute("INSERT INTO emotions (dream_id, emotion) VALUES (?, ?)", (dream_no, individual_emotion))
        db.commit()
        cursor.execute("SELECT emotion FROM emotions WHERE dream_id = ?", (dream_no,))
        emotion_data = cursor.fetchall()

        emotion_list = []
        for row in emotion_data:
            emotion_list.append(row["emotion"])
        
        dream_data['emotions'] = emotion_list
        return dream_data
    
    except sqlite3.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    
@app.get("/dreams")
def get_dreams_by_year_month(year: int, month: int, db: sqlite3.Connection = Depends(get_db)):
    try:
        if month > 12 or month < 1:
            raise HTTPException(status_code=400, detail="Invalid month")

        month_padded = str(month).zfill(2)
        query = f"""
            SELECT id, name, dream_date FROM dreams
            WHERE dream_date BETWEEN '{year}-{month_padded}-01' AND '{year}-{month_padded}-31'
        """

        cursor = db.cursor()
        cursor.execute(query)
        dreams_this_month = cursor.fetchall()
        result = []

        for individual_dream in dreams_this_month:
            dict_dream = dict(individual_dream)

            # Attach emotions for this dream
            cursor.execute("SELECT emotion FROM emotions WHERE dream_id = ?", (dict_dream["id"],))
            emotion_data = cursor.fetchall()
            emotion_list = [row["emotion"] for row in emotion_data]
            dict_dream["emotions"] = emotion_list

            result.append(dict_dream)

        return result
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
