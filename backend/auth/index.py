import json
import os
import secrets
import hashlib
import psycopg2

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_schema():
    return os.environ.get("MAIN_DB_SCHEMA", "public")

def handler(event: dict, context) -> dict:
    """Авторизация администраторов: login, logout, check, create-admin через action в body"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    action = body.get("action", "check")
    schema = get_schema()

    # Проверка сессии
    if action == "check":
        session_id = event.get("headers", {}).get("X-Session-Id", "")
        if not session_id:
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"ok": False})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT a.username FROM {schema}.sessions s JOIN {schema}.admins a ON a.id = s.admin_id WHERE s.id = %s AND s.expires_at > NOW()",
            (session_id,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"ok": False})}
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True, "username": row[0]})}

    # Вход
    if action == "login":
        username = body.get("username", "").strip()
        password = body.get("password", "")
        if not username or not password:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Введите логин и пароль"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id, password_hash FROM {schema}.admins WHERE username = %s", (username,))
        row = cur.fetchone()
        if not row or row[1] != hash_password(password):
            conn.close()
            return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Неверный логин или пароль"})}
        session_id = secrets.token_hex(32)
        cur.execute(f"INSERT INTO {schema}.sessions (id, admin_id) VALUES (%s, %s)", (session_id, row[0]))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"sessionId": session_id, "username": username})}

    # Выход
    if action == "logout":
        session_id = event.get("headers", {}).get("X-Session-Id", "")
        if session_id:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {schema}.sessions SET expires_at = NOW() WHERE id = %s", (session_id,))
            conn.commit()
            conn.close()
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True})}

    # Создание первого администратора
    if action == "create-admin":
        username = body.get("username", "").strip()
        password = body.get("password", "")
        if not username or not password:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нужны username и password"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) FROM {schema}.admins")
        count = cur.fetchone()[0]
        if count > 0:
            conn.close()
            return {"statusCode": 403, "headers": CORS_HEADERS, "body": json.dumps({"error": "Администраторы уже созданы"})}
        cur.execute(f"INSERT INTO {schema}.admins (username, password_hash) VALUES (%s, %s)", (username, hash_password(password)))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True})}

    return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Неизвестный action"})}
