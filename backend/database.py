import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 3つのデータベースへの接続URL（ポート5433環境を想定。5432の場合は書き換えてください）
STUDENT_DB_URL = os.environ.get("STUDENT_DB_URL", "postgresql://postgres:password@localhost:5433/matching_students")
COMPANY_DB_URL = os.environ.get("COMPANY_DB_URL", "postgresql://postgres:password@localhost:5433/matching_companies")
COURSE_DB_URL = os.environ.get("COURSE_DB_URL", "postgresql://postgres:password@localhost:5433/matching_courses")

# 各データベースの型（Engine）の作成
student_engine = create_engine(STUDENT_DB_URL, echo=False)
company_engine = create_engine(COMPANY_DB_URL, echo=False)
course_engine = create_engine(COURSE_DB_URL, echo=False)

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