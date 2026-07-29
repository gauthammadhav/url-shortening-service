from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.orm import Session
class Base(DeclarativeBase):
    pass
DaTABASE__URL = "sqlite:///./test.db"
engine = create_engine(DaTABASE__URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

