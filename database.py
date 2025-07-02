import sqlite3

def get_db():
    try:
        db = sqlite3.connect("./dream.db")
        with db as conn:
            cursor = conn.cursor()
            cursor.execute("PRAGMA foreign_keys = ON")
            conn.commit()
        db.row_factory = sqlite3.Row
        yield db
    finally:
        db.close()

def init_db():
    try:
        with sqlite3.connect("./dream.db") as conn:
            cursor = conn.cursor()
            cursor.execute("PRAGMA foreign_keys = ON")
            conn.commit()
            cursor.execute(
                """CREATE TABLE IF NOT EXISTS dreams(
                        id INTEGER PRIMARY KEY,
                        name TEXT NOT NULL,
                        description TEXT,
                        dream_date DATE NOT NULL,
                        lucidity BOOL,
                        sleep_duration SMALLINT,
                        recurring BOOL,
                        room_temp SMALLINT,
                        stress_before_sleep BOOL
                    )"""
            )
            cursor.execute(
                """CREATE TABLE IF NOT EXISTS emotions(
                        id INTEGER PRIMARY KEY,
                        dream_id INTEGER NOT NULL,
                        emotion TEXT NOT NULL,
                        FOREIGN KEY(dream_id) REFERENCES dreams(id) ON DELETE CASCADE
                    )"""
            )
            conn.commit()
    except sqlite3.OperationalError as e:
        print("Failed to create tables:" , e)