from sqlalchemy import Column, Integer, String, Float, Text
from database import Base

# ==========================================
# 1. 【学生DB (matching_students) のテーブル】
# ==========================================
class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    student_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String)

class StudentPreference(Base):
    __tablename__ = "student_preferences"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, index=True, nullable=False)
    company_id = Column(Integer, nullable=False)
    preference_order = Column(Integer, nullable=False)

class MatchResult(Base):
    __tablename__ = "match_results"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    company_id = Column(Integer, nullable=False)
    match_score = Column(Float, nullable=False)
    status = Column(String, default="候補")


# ==========================================
# 2. 【企業DB (matching_companies) のテーブル】
# ==========================================
class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, unique=True, index=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    location = Column(String)
    business_domain = Column(String, nullable=False)
    internship_description = Column(Text, nullable=False)


# ==========================================
# 3. 【講義DB (matching_courses) のテーブル】
# ==========================================
class CourseMaster(Base):
    __tablename__ = "course_masters"
    id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String, unique=True, nullable=False)
    year = Column(Integer, nullable=False)                  # 年次 (1~4)
    course_type = Column(String, nullable=False)           # 実習 / 演習 / 講義
    target_track = Column(String, nullable=False)          # 該当コース (例: 量子、バイオ、情報)

class StudentCourse(Base):
    __tablename__ = "student_courses"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, index=True, nullable=False)
    course_id = Column(Integer, nullable=False)

class CompanyRequirementCourse(Base):
    __tablename__ = "company_requirement_courses"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, index=True, nullable=False)
    course_id = Column(Integer, nullable=False)