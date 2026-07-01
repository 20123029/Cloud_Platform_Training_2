from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text  # ★生SQL実行のために追加
import database
import models

app = FastAPI(title="実習マッチングシステム")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.student_engine)
models.Base.metadata.create_all(bind=database.company_engine)
models.Base.metadata.create_all(bind=database.course_engine)

# ==========================================
# Pydanticインプット定義
# ==========================================
class CompanyInput(BaseModel):
    company_name: str
    capacity: int
    location: str
    business_domain: str
    internship_description: str
    required_course_ids: List[int]

class CourseInput(BaseModel):
    course_name: str
    year: int
    course_type: str
    target_track: str

class StudentInput(BaseModel):
    student_number: str
    name: str
    email: Optional[str] = ""

class StudentProfileUpdateInput(BaseModel):
    name: str
    email: str
    preference_company_ids: List[int]
    course_ids: List[int]

class LoginInput(BaseModel):
    username: str
    password: str


# ==========================================
# 企業データ一覧取得 API (新設)
# ==========================================
@app.get("/companies")
def get_companies(company_db: Session = Depends(database.get_company_db), course_db: Session = Depends(database.get_course_db)):
    """管理者画面・学生画面の双方から純粋に企業マスタ一覧を引くためのエンドポイント"""
    companies = company_db.query(models.Company).all()
    formatted_companies = []
    for cp in companies:
        req_cids = [rc.course_id for rc in course_db.query(models.CompanyRequirementCourse).filter(models.CompanyRequirementCourse.company_id == cp.id).all()]
        formatted_companies.append({
            "id": cp.id,
            "company_name": cp.company_name,
            "name": cp.company_name, 
            "capacity": cp.capacity,
            "location": cp.location,
            "business_domain": cp.business_domain,
            "internship_description": cp.internship_description,
            "required_course_ids": req_cids
        })
    return formatted_companies


# ==========================================
# 学生マイページ用 API
# ==========================================
@app.get("/student-profile/{student_id}")
def get_student_profile(
    student_id: int, 
    db: Session = Depends(database.get_student_db),
    company_db: Session = Depends(database.get_company_db),
    course_db: Session = Depends(database.get_course_db)
):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    companies = company_db.query(models.Company).all()
    courses = course_db.query(models.CourseMaster).all()

    current_courses = [c.course_id for c in course_db.query(models.StudentCourse).filter(models.StudentCourse.student_id == student_id).all()]
    prefs = db.query(models.StudentPreference).filter(models.StudentPreference.student_id == student_id).order_by(models.StudentPreference.preference_order).all()
    current_preferences = [p.company_id for p in prefs]

    formatted_companies = []
    for cp in companies:
        req_cids = [rc.course_id for rc in course_db.query(models.CompanyRequirementCourse).filter(models.CompanyRequirementCourse.company_id == cp.id).all()]
        formatted_companies.append({
            "id": cp.id,
            "company_name": cp.company_name,
            "name": cp.company_name,  
            "capacity": cp.capacity,
            "location": cp.location,
            "business_domain": cp.business_domain,
            "internship_description": cp.internship_description,
            "required_course_ids": req_cids
        })

    formatted_courses = []
    for c in courses:
        formatted_courses.append({
            "id": c.id,
            "course_name": c.course_name,
            "name": c.course_name,  
            "year": c.year,
            "course_type": c.course_type,
            "target_track": c.target_track
        })

    return {
        "profile": {
            "name": student.name, 
            "email": student.email if student.email else "", 
            "student_number": student.student_number
        },
        "current_courses": current_courses,
        "current_preferences": current_preferences,
        "masters": {
            "courses": formatted_courses,
            "companies": formatted_companies
        }
    }

@app.post("/student-profile/{student_id}/save")
def save_student_profile(
    student_id: int,
    data: StudentProfileUpdateInput,
    db: Session = Depends(database.get_student_db),
    course_db: Session = Depends(database.get_course_db)
):
    try:
        student = db.query(models.Student).filter(models.Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        student.name = data.name
        student.email = data.email

        db.query(models.StudentPreference).filter(models.StudentPreference.student_id == student_id).delete()
        for idx, comp_id in enumerate(data.preference_company_ids):
            db.add(models.StudentPreference(student_id=student_id, company_id=comp_id, preference_order=idx + 1))

        course_db.query(models.StudentCourse).filter(models.StudentCourse.student_id == student_id).delete()
        for course_id in data.course_ids:
            course_db.add(models.StudentCourse(student_id=student_id, course_id=course_id))

        db.commit()
        course_db.commit()
        return {"status": "success", "message": "申請内容を保存しました。"}
    except Exception as e:
        db.rollback()
        course_db.rollback()
        raise HTTPException(status_code=500, detail=f"保存に失敗しました: {str(e)}")
    

# ==========================================
# 認証・ログイン API (新設)
# ==========================================
@app.post("/login")
def login(data: LoginInput, db: Session = Depends(database.get_student_db)):
    # 1. 管理者ログイン
    if data.username == "admin" and data.password == "admin123":
        return {"role": "admin", "student_id": None}
    
    # 2. 学生ログイン (プロトタイプのため、学生のパスワードは全員共通で 'student123' とします)
    if data.password == "student123":
        # 入力されたユーザーID（学籍番号）でデータベースを検索
        student = db.query(models.Student).filter(models.Student.student_number == data.username).first()
        if student:
            return {"role": "student", "student_id": student.id}
            
    # 一致しない場合はエラーを返す
    raise HTTPException(status_code=401, detail="ユーザー名またはパスワードが正しくありません。")


# ==========================================
# 企業管理 API (登録 / 修正)
# ==========================================
@app.post("/companies/create")
def create_company(data: CompanyInput, company_db: Session = Depends(database.get_company_db), course_db: Session = Depends(database.get_course_db)):
    new_comp = models.Company(company_name=data.company_name, capacity=data.capacity, location=data.location, business_domain=data.business_domain, internship_description=data.internship_description)
    company_db.add(new_comp)
    company_db.flush()
    for cid in data.required_course_ids:
        course_db.add(models.CompanyRequirementCourse(company_id=new_comp.id, course_id=cid))
    company_db.commit()
    course_db.commit()
    return {"status": "success", "message": "企業データを新規登録しました。"}

@app.put("/companies/update/{company_id}")
def update_company(company_id: int, data: CompanyInput, company_db: Session = Depends(database.get_company_db), course_db: Session = Depends(database.get_course_db)):
    comp = company_db.query(models.Company).filter(models.Company.id == company_id).first()
    if not comp: raise HTTPException(status_code=404, detail="Company not found")
    comp.company_name = data.company_name
    comp.capacity = data.capacity
    comp.location = data.location
    comp.business_domain = data.business_domain
    comp.internship_description = data.internship_description
    
    course_db.query(models.CompanyRequirementCourse).filter(models.CompanyRequirementCourse.company_id == company_id).delete()
    for cid in data.required_course_ids:
        course_db.add(models.CompanyRequirementCourse(company_id=company_id, course_id=cid))
    company_db.commit()
    course_db.commit()
    return {"status": "success", "message": "企業データを修正・更新しました。"}

# ==========================================
# 講義マスタ管理 API
# ==========================================
@app.get("/admin/courses")
def get_admin_courses(course_db: Session = Depends(database.get_course_db)):
    return course_db.query(models.CourseMaster).order_by(models.CourseMaster.id).all()

@app.post("/admin/courses/create")
def create_course(data: CourseInput, course_db: Session = Depends(database.get_course_db)):
    new_c = models.CourseMaster(course_name=data.course_name, year=data.year, course_type=data.course_type, target_track=data.target_track)
    course_db.add(new_c)
    course_db.commit()
    return {"status": "success", "message": "講義マスタを新規登録しました。"}

@app.put("/admin/courses/update/{course_id}")
def update_course(course_id: int, data: CourseInput, course_db: Session = Depends(database.get_course_db)):
    c = course_db.query(models.CourseMaster).filter(models.CourseMaster.id == course_id).first()
    if not c: raise HTTPException(status_code=404, detail="Course not found")
    c.course_name = data.course_name
    c.year = data.year
    c.course_type = data.course_type
    c.target_track = data.target_track
    course_db.commit()
    return {"status": "success", "message": "講義マスタを更新しました。"}

# ==========================================
# 学生データ管理 API
# ==========================================
@app.get("/admin/students")
def get_admin_students(db: Session = Depends(database.get_student_db)):
    return db.query(models.Student).order_by(models.Student.id).all()

@app.post("/admin/students/create")
def create_student(data: StudentInput, db: Session = Depends(database.get_student_db)):
    new_s = models.Student(student_number=data.student_number, name=data.name, email=data.email)
    db.add(new_s)
    db.commit()
    return {"status": "success", "message": "学生アカウントを新規登録しました。"}

@app.put("/admin/students/update/{student_id}")
def update_student(student_id: int, data: StudentInput, db: Session = Depends(database.get_student_db)):
    s = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not s: raise HTTPException(status_code=404, detail="Student not found")
    s.student_number = data.student_number
    s.name = data.name
    s.email = data.email
    db.commit()
    return {"status": "success", "message": "学生データを更新しました。"}

# ==========================================
# マッチング計算 & モックデータ初期化
# ==========================================
@app.post("/run-matching/")
def run_matching(db: Session = Depends(database.get_student_db), company_db: Session = Depends(database.get_company_db), course_db: Session = Depends(database.get_course_db)):
    students = db.query(models.Student).all()
    companies = company_db.query(models.Company).all()
    if not students or not companies: raise HTTPException(status_code=400, detail="データが不足しています。")
    db.query(models.MatchResult).delete()
    db.commit()

    all_matches = []
    for s in students:
        s_prefs = {p.company_id: p.preference_order for p in db.query(models.StudentPreference).filter(models.StudentPreference.student_id == s.id).all()}
        s_cids = [sc.course_id for sc in course_db.query(models.StudentCourse).filter(models.StudentCourse.student_id == s.id).all()]
        for c in companies:
            pref_order = s_prefs.get(c.id, 0)
            pref_score = 100.0 if pref_order == 1 else (50.0 if pref_order == 2 else (20.0 if pref_order == 3 else 0.0))
            
            course_bonus = 0.0
            c_req_courses = course_db.query(models.CompanyRequirementCourse).filter(models.CompanyRequirementCourse.company_id == c.id).all()
            for rc in c_req_courses:
                if rc.course_id in s_cids: course_bonus += 25.0

            all_matches.append({"student_id": s.id, "student_name": s.name, "company_id": c.id, "company_name": c.company_name, "company_domain": c.business_domain, "score": pref_score + course_bonus})

    all_matches.sort(key=lambda x: x["score"], reverse=True)
    company_capacity = {c.id: c.capacity for c in companies}
    assigned = set()
    final_matches = []

    for m in all_matches:
        s_id, c_id = m["student_id"], m["company_id"]
        if s_id not in assigned and company_capacity.get(c_id, 0) > 0:
            assigned.add(s_id)
            company_capacity[c_id] -= 1
            db.add(models.MatchResult(student_id=s_id, company_id=c_id, match_score=m["score"], status="確定"))
            final_matches.append({"student_name": m["student_name"], "company_name": m["company_name"], "company_domain": m["company_domain"], "calculated_score": m["score"], "status": "確定"})
    db.commit()
    return {"status": "success", "matches": final_matches}

@app.post("/setup-mock-data/")
def setup_mock_data(
    db: Session = Depends(database.get_student_db),
    company_db: Session = Depends(database.get_company_db),
    course_db: Session = Depends(database.get_course_db)
):
    try:
        # ★【修正】PostgreSQLの主キーシーケンス（Serial型カウンタ）を1にリセットして全削除
        db.execute(text("TRUNCATE TABLE match_results, student_preferences, students RESTART IDENTITY CASCADE;"))
        company_db.execute(text("TRUNCATE TABLE companies RESTART IDENTITY CASCADE;"))
        course_db.execute(text("TRUNCATE TABLE company_requirement_courses, student_courses, course_masters RESTART IDENTITY CASCADE;"))
        
        db.commit()
        company_db.commit()
        course_db.commit()

        # 2. 講義マスタの投入 
        c1 = models.CourseMaster(course_name="量子力学セミナー", year=3, course_type="演習", target_track="量子計算")
        c2 = models.CourseMaster(course_name="バイオ情報テクノロジー", year=2, course_type="実習", target_track="バイオ情報科学")
        c3 = models.CourseMaster(course_name="高度先端アルゴリズム論", year=4, course_type="講義", target_track="情報工学")
        course_db.add_all([c1, c2, c3])
        course_db.flush()

        # 3. 初期学生の投入 (これで山田太郎が毎回確実に ID: 1 に固定されます)
        s1 = models.Student(student_number="S202601", name="山田太郎", email="yamada@univ.ac.jp")
        s2 = models.Student(student_number="S202602", name="鈴木二郎", email="suzuki@univ.ac.jp")
        db.add_all([s1, s2])
        db.flush()

        # 4. 学生の初期履修データの登録
        course_db.add(models.StudentCourse(student_id=s1.id, course_id=c1.id))
        course_db.add(models.StudentCourse(student_id=s1.id, course_id=c2.id))
        course_db.add(models.StudentCourse(student_id=s2.id, course_id=c2.id))

        # 5. 初期企業の投入
        comp1 = models.Company(company_name="Mebius先端バイオ量子研究所", capacity=2, location="東京", business_domain="バイオ×量子", internship_description="量子アルゴリズムを適用した新規創薬プロトタイピングの実習。")
        company_db.add(comp1)
        company_db.flush()

        # 6. 企業の要求授業の登録
        course_db.add(models.CompanyRequirementCourse(company_id=comp1.id, course_id=c1.id))

        db.commit()
        company_db.commit()
        course_db.commit()

        return {"status": "success", "message": "3つのデータベースのカウンタをリセットし、初期データを完全に復元しました。"}

    except Exception as e:
        db.rollback()
        company_db.rollback()
        course_db.rollback()
        raise HTTPException(status_code=500, detail=f"初期化中にエラーが発生しました: {str(e)}")