FROM python:3.11-slim

RUN useradd -m messenger_user
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R messenger_user:messenger_user /app
USER messenger_user

EXPOSE 5000

CMD ["python", "app.py"]