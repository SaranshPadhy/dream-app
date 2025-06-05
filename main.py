import sqlite3, json
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional
from schema import DreamSchema
from database import get_db, init_db

app = FastAPI()

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



@app.put("/dreams/{id}")



@app.post("/dreams")
def add_dream(dream: DreamSchema, db: sqlite3.Connection = Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO dreams (name, description, dream_date, lucidity, sleep_duration, recurring, room_temp, stress_before_sleep) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (dream.name, dream.description, dream.dreamdate, dream.lucidity, dream.sleepduration, dream.recurring, dream.roomtemp, dream.stressbeforesleep)
        )
        db.commit()
        dream_no = cursor.lastrowid

        cursor.execute("SELECT * FROM dreams WHERE id = ?", (dream_no,))
        dream_data = cursor.fetchone()

        if dream_data is None:
            raise HTTPException(status_code=404, detail="Dream not found after insertion")
        
        dream_data = dict(dream_data)
        for individual_emotion in dream.emotions:
            cursor.execute("INSERT INTO emotions (dream_id, emotion) VALUES (?, ?)", 
                           (dream_no, individual_emotion))
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