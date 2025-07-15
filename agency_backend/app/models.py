from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .database import Base

class RoleEnum(str, enum.Enum):
    designer = "designer"
    smm_manager = "smm_manager"
    head_smm = "head_smm"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    login = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    hashed_password = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.designer)

    tasks = relationship(
        "Task",
        foreign_keys="Task.executor_id",
        back_populates="executor",
    )

    authored_tasks = relationship(
        "Task",
        foreign_keys="Task.author_id",
        back_populates="author",
    )

class TaskStatus(str, enum.Enum):
    in_progress = "in_progress"
    done = "done"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    project = Column(String, index=True)
    deadline = Column(DateTime)
    status = Column(Enum(TaskStatus), default=TaskStatus.in_progress)
    task_type = Column(String, nullable=True)
    task_format = Column(String, nullable=True)
    high_priority = Column(Boolean, default=False)
    executor_id = Column(Integer, ForeignKey("users.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

    executor = relationship(
        "User",
        foreign_keys=[executor_id],
        back_populates="tasks",
    )
    author = relationship(
        "User",
        foreign_keys=[author_id],
        back_populates="authored_tasks",
    )

class OperatorRole(str, enum.Enum):
    mobile = "mobile"
    video = "video"

class Operator(Base):
    __tablename__ = "operators"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(Enum(OperatorRole))
    color = Column(String, default="#ff0000")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Shooting(Base):
    __tablename__ = "shootings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    project = Column(String, nullable=True)
    quantity = Column(Integer, nullable=True)
    operator_id = Column(Integer, ForeignKey("operators.id"))
    managers = Column(String, nullable=True)
    datetime = Column(DateTime)
    end_datetime = Column(DateTime)
    completed = Column(Boolean, default=False)
    completed_quantity = Column(Integer, nullable=True)
    completed_managers = Column(String, nullable=True)
    completed_operators = Column(String, nullable=True)

    operator = relationship("Operator")


class ProjectReport(Base):
    __tablename__ = "project_reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True)
    contract_amount = Column(Integer, default=0)
    receipts = Column(Integer, default=0)

    project = relationship("Project")


class ProjectExpense(Base):
    __tablename__ = "project_expenses"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String)
    amount = Column(Integer)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")


class ProjectReceipt(Base):
    __tablename__ = "project_receipts"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String)
    amount = Column(Integer)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")


class ProjectClientExpense(Base):
    __tablename__ = "project_client_expenses"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String)
    amount = Column(Integer)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")
