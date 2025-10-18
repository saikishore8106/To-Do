FROM python:3.10
WORKDIR /app
COPY . /app
RUN pip install -r requirements.txt
ENV DATABASE_URL=postgresql://postgres:1234@todo-db:5432/todo_db
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

