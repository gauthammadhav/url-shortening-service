from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class URL(Base):
    __tablename__ = "urls"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    original_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    short_code: Mapped[str] = mapped_column(String(6), unique=True, nullable=False)
    click_count: Mapped[int] = mapped_column(default=0, nullable=False,server_default='0')
    
    
    
    
    