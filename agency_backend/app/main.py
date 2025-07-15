from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from datetime import datetime

from . import models, schemas, crud, auth
from .database import engine, Base, SessionLocal

load_dotenv()
Base.metadata.create_all(bind=engine)


def create_default_admin():
    db = SessionLocal()
    try:
        if not crud.get_user_by_login(db, "admin"):
            admin = schemas.UserCreate(
                login="admin",
                name="Administrator",
                password="admin123",
                role=models.RoleEnum.admin,
            )
            crud.create_user(db, admin)
    finally:
        db.close()

create_default_admin()

app = FastAPI(title="Agency API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(auth.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = auth.create_access_token(data={"sub": user.login})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if current.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_user = crud.get_user_by_login(db, user.login)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db, user)


@app.get("/users/", response_model=list[schemas.User])
def list_users(db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    return crud.get_users(db)


@app.get("/users/me", response_model=schemas.User)
def read_current_user(current: models.User = Depends(auth.get_current_active_user)):
    return current


@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if current.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    updated = crud.update_user(db, user_id, user)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if current.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    crud.delete_user(db, user_id)
    return {"ok": True}


@app.get("/tasks/", response_model=list[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    return crud.get_tasks_for_user(db, current, skip=skip, limit=limit)


@app.post("/tasks/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    return crud.create_task(db, task, author_id=current.id)


@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task: schemas.TaskCreate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    updated = crud.update_task(db, task_id, task)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current.id not in [task.author_id, task.executor_id]:
        raise HTTPException(status_code=403, detail="Not allowed")
    crud.delete_task(db, task_id)
    return {"ok": True}


@app.patch("/tasks/{task_id}/status", response_model=schemas.Task)
def update_task_status(
    task_id: int,
    status: str,
    db: Session = Depends(auth.get_db),
    current: models.User = Depends(auth.get_current_active_user),
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current.id not in [task.executor_id, task.author_id]:
        raise HTTPException(status_code=403, detail="Not allowed")
    return crud.update_task_status(db, task_id, status)


@app.get("/operators/", response_model=list[schemas.Operator])
def list_operators(db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    return crud.get_operators(db)


@app.post("/operators/", response_model=schemas.Operator)
def create_operator(op: schemas.OperatorCreate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if current.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.create_operator(db, op)


@app.put("/operators/{op_id}", response_model=schemas.Operator)
def update_operator(op_id: int, op: schemas.OperatorCreate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if current.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    updated = crud.update_operator(db, op_id, op)
    if not updated:
        raise HTTPException(status_code=404, detail="Operator not found")
    return updated


@app.delete("/operators/{op_id}")
def delete_operator(op_id: int, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if current.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    crud.delete_operator(db, op_id)
    return {"ok": True}


@app.get("/projects/", response_model=list[schemas.Project])
def list_projects(db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    return crud.get_projects(db)


@app.post("/projects/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if current.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.create_project(db, project.name)


@app.put("/projects/{project_id}", response_model=schemas.Project)
def update_project(project_id: int, project: schemas.ProjectCreate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if current.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    updated = crud.update_project(db, project_id, project.name)
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated


@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if current.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    crud.delete_project(db, project_id)
    return {"ok": True}


@app.get("/projects/{project_id}/report", response_model=schemas.ProjectReport)
def get_project_report(
    project_id: int,
    month: int | None = None,
    db: Session = Depends(auth.get_db),
    current: models.User = Depends(auth.get_current_active_user),
):
    today = datetime.utcnow()
    m = month or today.month
    start = datetime(today.year, m, 1)
    end_month = m + 1
    end_year = today.year
    if end_month > 12:
        end_month = 1
        end_year += 1
    end = datetime(end_year, end_month, 1)
    report = crud.get_or_create_report(db, project_id, m, today.year)
    expenses = crud.get_expenses(db, project_id, start, end)
    client_expenses = crud.get_client_expenses(db, project_id, start, end)
    receipts_list = crud.get_receipts(db, project_id, start, end)
    receipts_sum = sum(r.amount for r in receipts_list)
    client_sum = sum(e.amount for e in client_expenses)
    total_expenses = sum(e.amount for e in expenses) + client_sum
    balance_after_tax = receipts_sum * 0.83
    debt = report.contract_amount - receipts_sum + client_sum
    positive_balance = balance_after_tax - total_expenses
    return schemas.ProjectReport(
        project_id=project_id,
        contract_amount=report.contract_amount,
        receipts=receipts_sum,
        receipts_list=receipts_list,
        client_expenses=client_expenses,
        total_expenses=total_expenses,
        debt=debt,
        balance_after_tax=balance_after_tax,
        positive_balance=positive_balance,
        expenses=expenses,
    )


@app.put("/projects/{project_id}/report", response_model=schemas.ProjectReport)
def update_project_report(
    project_id: int,
    data: schemas.ProjectReportUpdate,
    month: int | None = None,
    db: Session = Depends(auth.get_db),
    current: models.User = Depends(auth.get_current_active_user),
):
    today = datetime.utcnow()
    m = month or today.month
    start = datetime(today.year, m, 1)
    end_month = m + 1
    end_year = today.year
    if end_month > 12:
        end_month = 1
        end_year += 1
    end = datetime(end_year, end_month, 1)
    report = crud.update_report(db, project_id, data, m, today.year)
    expenses = crud.get_expenses(db, project_id, start, end)
    client_expenses = crud.get_client_expenses(db, project_id, start, end)
    receipts_list = crud.get_receipts(db, project_id, start, end)
    receipts_sum = sum(r.amount for r in receipts_list)
    client_sum = sum(e.amount for e in client_expenses)
    total_expenses = sum(e.amount for e in expenses) + client_sum
    balance_after_tax = receipts_sum * 0.83
    debt = report.contract_amount - receipts_sum + client_sum
    positive_balance = balance_after_tax - total_expenses
    return schemas.ProjectReport(
        project_id=project_id,
        contract_amount=report.contract_amount,
        receipts=receipts_sum,
        receipts_list=receipts_list,
        client_expenses=client_expenses,
        total_expenses=total_expenses,
        debt=debt,
        balance_after_tax=balance_after_tax,
        positive_balance=positive_balance,
        expenses=expenses,
    )


@app.get("/projects/{project_id}/expenses", response_model=list[schemas.Expense])
def list_expenses(
    project_id: int,
    month: int | None = None,
    db: Session = Depends(auth.get_db),
    current: models.User = Depends(auth.get_current_active_user),
):
    today = datetime.utcnow()
    m = month or today.month
    start = datetime(today.year, m, 1)
    end_month = m + 1
    end_year = today.year
    if end_month > 12:
        end_month = 1
        end_year += 1
    end = datetime(end_year, end_month, 1)
    return crud.get_expenses(db, project_id, start, end)


@app.post("/projects/{project_id}/expenses", response_model=schemas.Expense)
def add_expense(
    project_id: int,
    exp: schemas.ExpenseCreate,
    month: int | None = None,
    db: Session = Depends(auth.get_db),
    current: models.User = Depends(auth.get_current_active_user),
):
    today = datetime.utcnow()
    return crud.create_expense(db, project_id, exp, month or today.month, today.year)


@app.put("/expenses/{expense_id}", response_model=schemas.Expense)
def edit_expense(expense_id: int, exp: schemas.ExpenseCreate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    updated = crud.update_expense(db, expense_id, exp)
    if not updated:
        raise HTTPException(status_code=404, detail="Expense not found")
    return updated


@app.delete("/expenses/{expense_id}")
def remove_expense(expense_id: int, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    crud.delete_expense(db, expense_id)
    return {"ok": True}


@app.get("/projects/{project_id}/client_expenses", response_model=list[schemas.ClientExpense])
def list_client_expenses(
    project_id: int,
    month: int | None = None,
    db: Session = Depends(auth.get_db),
    current: models.User = Depends(auth.get_current_active_user),
):
    today = datetime.utcnow()
    m = month or today.month
    start = datetime(today.year, m, 1)
    end_month = m + 1
    end_year = today.year
    if end_month > 12:
        end_month = 1
        end_year += 1
    end = datetime(end_year, end_month, 1)
    return crud.get_client_expenses(db, project_id, start, end)


@app.post("/projects/{project_id}/client_expenses", response_model=schemas.ClientExpense)
def add_client_expense(
    project_id: int,
    exp: schemas.ClientExpenseCreate,
    month: int | None = None,
    db: Session = Depends(auth.get_db),
    current: models.User = Depends(auth.get_current_active_user),
):
    today = datetime.utcnow()
    return crud.create_client_expense(db, project_id, exp, month or today.month, today.year)


@app.put("/client_expenses/{expense_id}", response_model=schemas.ClientExpense)
def edit_client_expense(expense_id: int, exp: schemas.ClientExpenseCreate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    updated = crud.update_client_expense(db, expense_id, exp)
    if not updated:
        raise HTTPException(status_code=404, detail="Client expense not found")
    return updated


@app.post("/client_expenses/{expense_id}/close", response_model=schemas.ClientExpense | None)
def close_client_expense(expense_id: int, data: schemas.ClientExpenseClose, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    return crud.close_client_expense(db, expense_id, data.amount, data.comment)


@app.delete("/client_expenses/{expense_id}")
def remove_client_expense(expense_id: int, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    crud.delete_client_expense(db, expense_id)
    return {"ok": True}


@app.get("/projects/{project_id}/receipts", response_model=list[schemas.Receipt])
def list_receipts(
    project_id: int,
    month: int | None = None,
    db: Session = Depends(auth.get_db),
    current: models.User = Depends(auth.get_current_active_user),
):
    today = datetime.utcnow()
    m = month or today.month
    start = datetime(today.year, m, 1)
    end_month = m + 1
    end_year = today.year
    if end_month > 12:
        end_month = 1
        end_year += 1
    end = datetime(end_year, end_month, 1)
    return crud.get_receipts(db, project_id, start, end)


@app.post("/projects/{project_id}/receipts", response_model=schemas.Receipt)
def add_receipt(
    project_id: int,
    rec: schemas.ReceiptCreate,
    month: int | None = None,
    db: Session = Depends(auth.get_db),
    current: models.User = Depends(auth.get_current_active_user),
):
    today = datetime.utcnow()
    return crud.create_receipt(db, project_id, rec, month or today.month, today.year)


@app.put("/receipts/{receipt_id}", response_model=schemas.Receipt)
def edit_receipt(receipt_id: int, rec: schemas.ReceiptCreate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    updated = crud.update_receipt(db, receipt_id, rec)
    if not updated:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return updated


@app.delete("/receipts/{receipt_id}")
def remove_receipt(receipt_id: int, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    crud.delete_receipt(db, receipt_id)
    return {"ok": True}


@app.get("/shootings/", response_model=list[schemas.Shooting])
def list_shootings(db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    return crud.get_shootings(db)


def _shoot_perm(user: models.User):
    return user.role in [models.RoleEnum.smm_manager, models.RoleEnum.head_smm, models.RoleEnum.admin]


@app.post("/shootings/", response_model=schemas.Shooting)
def create_shooting(shooting: schemas.ShootingCreate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if not _shoot_perm(current):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.create_shooting(db, shooting)


@app.put("/shootings/{sid}", response_model=schemas.Shooting)
def update_shooting(sid: int, shooting: schemas.ShootingCreate, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if not _shoot_perm(current):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    updated = crud.update_shooting(db, sid, shooting)
    if not updated:
        raise HTTPException(status_code=404, detail="Shooting not found")
    return updated


@app.delete("/shootings/{sid}")
def delete_shooting(sid: int, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if not _shoot_perm(current):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    crud.delete_shooting(db, sid)
    return {"ok": True}


@app.post("/shootings/{sid}/complete", response_model=schemas.Shooting)
def complete_shooting(sid: int, data: schemas.ShootingComplete, db: Session = Depends(auth.get_db), current: models.User = Depends(auth.get_current_active_user)):
    if not _shoot_perm(current):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    sh = crud.complete_shooting(db, sid, data.quantity, data.managers, data.operators)
    if not sh:
        raise HTTPException(status_code=404, detail="Shooting not found")
    return sh
