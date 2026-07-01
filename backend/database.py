import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

def format_db_url(url: str) -> str:
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url

STUDENT_DB_URL = format_db_url(os.environ.get("STUDENT_DB_URL", "postgresql://postgres:password@localhost:5433/matching_students"))
COMPANY_DB_URL = format_db_url(os.environ.get("COMPANY_DB_URL", "postgresql://postgres:password@localhost:5433/matching_companies"))
COURSE_DB_URL = format_db_url(os.environ.get("COURSE_DB_URL", "postgresql://postgres:password@localhost:5433/matching_courses"))

# セッションクラスの作成
StudentSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=student_engine)
CompanySessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=company_engine)
CourseSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=course_engine)

Base = declarative_base()

# FastAPI用の共通Dependency
def get_student_db():
    db = StudentSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_company_db():
    db = CompanySessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_course_db():
    db = CourseSessionLocal()
    try:
        yield db
    finally:
        db.close()