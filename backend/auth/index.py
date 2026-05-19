import json
import os
import hashlib
import secrets
import smtplib
from email.mime.text import MIMEText
import psycopg2
from datetime import datetime, timedelta, timezone

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p65094263_small_producers_cata')

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def send_confirmation_email(to_email: str, token: str):
    print(f"CONFIRM TOKEN for {to_email}: {token}")

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id, X-Authorization',
        'Access-Control-Max-Age': '86400',
    }

def ok(data):
    return {'statusCode': 200, 'headers': {**cors_headers(), 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False)}

def err(code, msg):
    return {'statusCode': code, 'headers': {**cors_headers(), 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}

def handler(event: dict, context) -> dict:
    """Auth: register, login, confirm-email, me, logout, resend-confirmation"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action') or path.rstrip('/').split('/')[-1]

    db = get_db()
    cur = db.cursor()

    try:
        if method == 'POST' and action == 'register':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            role = body.get('role', 'manufacturer')

            if not email or not password:
                return err(400, 'Укажите email и пароль')
            if len(password) < 6:
                return err(400, 'Пароль должен быть не менее 6 символов')
            if role not in ('manufacturer', 'visitor'):
                role = 'manufacturer'

            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", (email,))
            if cur.fetchone():
                return err(409, 'Пользователь с таким email уже существует')

            pwd_hash = hash_password(password)
            token = secrets.token_urlsafe(32)
            expires = datetime.now(timezone.utc) + timedelta(hours=24)

            cur.execute(
                f"INSERT INTO {SCHEMA}.users (email, password_hash, role, email_confirmed, email_verification_token, email_verification_expires) VALUES (%s, %s, %s, false, %s, %s) RETURNING id",
                (email, pwd_hash, role, token, expires)
            )
            user_id = cur.fetchone()[0]
            db.commit()

            send_confirmation_email(email, token)
            return ok({'user_id': user_id, 'email': email, 'role': role, 'email_confirmed': False, 'confirmation_token': token})

        elif method == 'POST' and action == 'login':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')

            if not email or not password:
                return err(400, 'Укажите email и пароль')

            pwd_hash = hash_password(password)
            cur.execute(
                f"SELECT id, role, email_confirmed FROM {SCHEMA}.users WHERE email = %s AND password_hash = %s",
                (email, pwd_hash)
            )
            row = cur.fetchone()
            if not row:
                return err(401, 'Неверный email или пароль')

            user_id, role, email_confirmed = row

            if not email_confirmed:
                return err(403, 'Email не подтверждён. Проверьте почту.')

            session_token = secrets.token_urlsafe(32)
            expires = datetime.now(timezone.utc) + timedelta(days=30)
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
                (user_id, session_token, expires)
            )
            db.commit()
            return ok({'user_id': user_id, 'role': role, 'token': session_token, 'email': email})

        elif method == 'POST' and action == 'confirm-email':
            token = body.get('token', '')
            if not token:
                return err(400, 'Не указан токен')

            cur.execute(
                f"SELECT id FROM {SCHEMA}.users WHERE email_verification_token = %s AND email_verification_expires > now()",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return err(400, 'Неверный или просроченный токен')

            user_id = row[0]
            cur.execute(
                f"UPDATE {SCHEMA}.users SET email_confirmed = true, email_verification_token = NULL WHERE id = %s",
                (user_id,)
            )
            db.commit()
            return ok({'success': True, 'user_id': user_id})

        elif method == 'GET' and action == 'me':
            auth = event.get('headers', {}).get('X-Authorization') or event.get('headers', {}).get('x-authorization', '')
            token = auth.replace('Bearer ', '').strip()
            if not token:
                return err(401, 'Не авторизован')

            cur.execute(
                f"SELECT u.id, u.email, u.role FROM {SCHEMA}.users u JOIN {SCHEMA}.sessions s ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > now()",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return err(401, 'Сессия истекла')

            user_id, email, role = row
            return ok({'user_id': user_id, 'email': email, 'role': role})

        elif method == 'POST' and action == 'logout':
            auth = event.get('headers', {}).get('X-Authorization') or event.get('headers', {}).get('x-authorization', '')
            token = auth.replace('Bearer ', '').strip()
            if token:
                cur.execute(f"DELETE FROM {SCHEMA}.sessions WHERE token = %s", (token,))
                db.commit()
            return ok({'success': True})

        elif method == 'POST' and action == 'resend-confirmation':
            email = body.get('email', '').strip().lower()
            if not email:
                return err(400, 'Укажите email')

            cur.execute(f"SELECT id, email_confirmed FROM {SCHEMA}.users WHERE email = %s", (email,))
            row = cur.fetchone()
            if not row:
                return err(404, 'Пользователь не найден')
            user_id, confirmed = row
            if confirmed:
                return err(400, 'Email уже подтверждён')

            token = secrets.token_urlsafe(32)
            expires = datetime.now(timezone.utc) + timedelta(hours=24)
            cur.execute(
                f"UPDATE {SCHEMA}.users SET email_verification_token = %s, email_verification_expires = %s WHERE id = %s",
                (token, expires, user_id)
            )
            db.commit()
            send_confirmation_email(email, token)
            return ok({'success': True, 'confirmation_token': token})

        else:
            return err(404, 'Не найдено')

    finally:
        cur.close()
        db.close()