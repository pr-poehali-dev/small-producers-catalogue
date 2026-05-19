import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p65094263_small_producers_cata')

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
        'Access-Control-Max-Age': '86400',
    }

def ok(data):
    return {'statusCode': 200, 'headers': {**cors_headers(), 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}

def err(code, msg):
    return {'statusCode': code, 'headers': {**cors_headers(), 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}

def get_user_from_token(cur, token):
    if not token:
        return None
    cur.execute(
        f"SELECT u.id, u.role FROM {SCHEMA}.users u JOIN {SCHEMA}.sessions s ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > now()",
        (token,)
    )
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    """Кабинет посетителя: избранное и чаты"""
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

    auth = event.get('headers', {}).get('X-Authorization') or event.get('headers', {}).get('x-authorization', '')
    token = auth.replace('Bearer ', '').strip()

    db = get_db()
    cur = db.cursor()

    try:
        qs = event.get('queryStringParameters') or {}
        action = qs.get('action') or path.rstrip('/').split('/')[-1]
        user = get_user_from_token(cur, token)
        if not user:
            return err(401, 'Не авторизован')
        user_id = user[0]

        if method == 'GET' and action == 'favorites':
            cur.execute(
                f"SELECT id, type, ref_id, created_at FROM {SCHEMA}.visitor_favorites WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            )
            rows = cur.fetchall()
            return ok([{'id': r[0], 'type': r[1], 'ref_id': r[2], 'created_at': str(r[3])} for r in rows])

        elif method == 'POST' and action == 'toggle':
            fav_type = body.get('type')
            ref_id = str(body.get('ref_id', ''))
            if not fav_type or not ref_id:
                return err(400, 'Укажите type и ref_id')

            cur.execute(
                f"SELECT id FROM {SCHEMA}.visitor_favorites WHERE user_id=%s AND type=%s AND ref_id=%s",
                (user_id, fav_type, ref_id)
            )
            existing = cur.fetchone()
            if existing:
                cur.execute(f"DELETE FROM {SCHEMA}.visitor_favorites WHERE id=%s", (existing[0],))
                db.commit()
                return ok({'action': 'removed'})
            else:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.visitor_favorites (user_id, type, ref_id) VALUES (%s,%s,%s)",
                    (user_id, fav_type, ref_id)
                )
                db.commit()
                return ok({'action': 'added'})

        elif method == 'GET' and action == 'chats':
            cur.execute(
                f"""SELECT c.id, c.manufacturer_id, m.brand, m.photo_url,
                    (SELECT body FROM {SCHEMA}.chat_messages WHERE chat_id=c.id ORDER BY created_at DESC LIMIT 1) as last_msg,
                    (SELECT created_at FROM {SCHEMA}.chat_messages WHERE chat_id=c.id ORDER BY created_at DESC LIMIT 1) as last_at
                    FROM {SCHEMA}.chats c JOIN {SCHEMA}.manufacturers m ON m.id=c.manufacturer_id
                    WHERE c.visitor_id=%s ORDER BY last_at DESC NULLS LAST""",
                (user_id,)
            )
            rows = cur.fetchall()
            return ok([{'chat_id': r[0], 'manufacturer_id': r[1], 'brand': r[2], 'photo_url': r[3], 'last_msg': r[4], 'last_at': str(r[5]) if r[5] else None} for r in rows])

        elif method == 'GET' and action == 'chat-messages':
            chat_id = (event.get('queryStringParameters') or {}).get('chat_id')
            if not chat_id:
                return err(400, 'Укажите chat_id')

            cur.execute(f"SELECT visitor_id FROM {SCHEMA}.chats WHERE id=%s", (int(chat_id),))
            chat = cur.fetchone()
            if not chat or chat[0] != user_id:
                return err(403, 'Нет доступа')

            cur.execute(
                f"SELECT id, sender_id, body, created_at FROM {SCHEMA}.chat_messages WHERE chat_id=%s ORDER BY created_at",
                (int(chat_id),)
            )
            rows = cur.fetchall()
            return ok([{'id': r[0], 'sender_id': r[1], 'body': r[2], 'created_at': str(r[3])} for r in rows])

        elif method == 'POST' and action == 'send-message':
            manufacturer_id = body.get('manufacturer_id')
            msg_body = body.get('body', '').strip()

            if not manufacturer_id or not msg_body:
                return err(400, 'Укажите manufacturer_id и body')

            cur.execute(
                f"SELECT id FROM {SCHEMA}.chats WHERE visitor_id=%s AND manufacturer_id=%s",
                (user_id, manufacturer_id)
            )
            chat_row = cur.fetchone()
            if chat_row:
                chat_id = chat_row[0]
            else:
                cur.execute(f"SELECT user_id FROM {SCHEMA}.manufacturers WHERE id=%s", (manufacturer_id,))
                mfr = cur.fetchone()
                if not mfr:
                    return err(404, 'Производитель не найден')
                cur.execute(
                    f"INSERT INTO {SCHEMA}.chats (visitor_id, manufacturer_user_id, manufacturer_id) VALUES (%s,%s,%s) RETURNING id",
                    (user_id, mfr[0], manufacturer_id)
                )
                chat_id = cur.fetchone()[0]

            cur.execute(
                f"INSERT INTO {SCHEMA}.chat_messages (chat_id, sender_id, body) VALUES (%s,%s,%s) RETURNING id",
                (chat_id, user_id, msg_body)
            )
            msg_id = cur.fetchone()[0]
            db.commit()
            return ok({'chat_id': chat_id, 'message_id': msg_id})

        else:
            return err(404, 'Не найдено')

    finally:
        cur.close()
        db.close()