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
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id, X-Authorization',
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
    """Управление профилями производителей: сохранение, получение, модерация"""
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
        action = path.rstrip('/').split('/')[-1]

        # GET /list — список одобренных (публичный)
        if method == 'GET' and action == 'list':
            cur.execute(
                f"SELECT id, brand, owner_name, region, category, description, story, photo_url, phone, email, telegram, website, status FROM {SCHEMA}.manufacturers WHERE status = 'approved' ORDER BY id"
            )
            rows = cur.fetchall()
            cols = ['id','brand','owner_name','region','category','description','story','photo_url','phone','email','telegram','website','status']
            return ok([dict(zip(cols, r)) for r in rows])

        # GET /all — все (только для admin)
        elif method == 'GET' and action == 'all':
            user = get_user_from_token(cur, token)
            if not user or user[1] != 'admin':
                return err(403, 'Нет доступа')
            cur.execute(
                f"SELECT id, brand, owner_name, region, category, description, story, photo_url, phone, email, telegram, website, status, reject_reason, created_at FROM {SCHEMA}.manufacturers ORDER BY created_at DESC"
            )
            rows = cur.fetchall()
            cols = ['id','brand','owner_name','region','category','description','story','photo_url','phone','email','telegram','website','status','reject_reason','created_at']
            return ok([dict(zip(cols, r)) for r in rows])

        # GET /my — профиль текущего производителя
        elif method == 'GET' and action == 'my':
            user = get_user_from_token(cur, token)
            if not user:
                return err(401, 'Не авторизован')
            cur.execute(
                f"SELECT id, brand, owner_name, region, category, description, story, photo_url, phone, email, telegram, website, status, reject_reason FROM {SCHEMA}.manufacturers WHERE user_id = %s",
                (user[0],)
            )
            row = cur.fetchone()
            if not row:
                return ok(None)
            cols = ['id','brand','owner_name','region','category','description','story','photo_url','phone','email','telegram','website','status','reject_reason']
            return ok(dict(zip(cols, row)))

        # POST /save — сохранить/обновить профиль производителя (отправить на модерацию)
        elif method == 'POST' and action == 'save':
            user = get_user_from_token(cur, token)
            if not user:
                return err(401, 'Не авторизован')

            brand = body.get('brand', '').strip()
            owner_name = body.get('owner_name', '').strip()
            region = body.get('region', '').strip()
            category = body.get('category', '').strip()
            description = body.get('description', '').strip()
            story = body.get('story', '').strip()
            phone = body.get('phone', '').strip()
            email = body.get('email', '').strip()
            telegram = body.get('telegram', '').strip()
            website = body.get('website', '').strip()

            if not brand or not owner_name or not region or not category:
                return err(400, 'Заполните обязательные поля: бренд, имя, регион, категория')

            # Проверяем есть ли уже профиль
            cur.execute(f"SELECT id, status FROM {SCHEMA}.manufacturers WHERE user_id = %s", (user[0],))
            existing = cur.fetchone()

            if existing:
                mfr_id, old_status = existing
                # Если был rejected — переводим в pending при пересохранении
                new_status = 'pending' if old_status == 'rejected' else old_status
                cur.execute(
                    f"UPDATE {SCHEMA}.manufacturers SET brand=%s, owner_name=%s, region=%s, category=%s, description=%s, story=%s, phone=%s, email=%s, telegram=%s, website=%s, status=%s, updated_at=now() WHERE id=%s",
                    (brand, owner_name, region, category, description, story, phone, email, telegram, website, new_status, mfr_id)
                )
            else:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.manufacturers (user_id, brand, owner_name, region, category, description, story, phone, email, telegram, website, status) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'pending') RETURNING id",
                    (user[0], brand, owner_name, region, category, description, story, phone, email, telegram, website)
                )
                mfr_id = cur.fetchone()[0]

            db.commit()
            return ok({'success': True, 'manufacturer_id': mfr_id})

        # POST /moderate — одобрить/отклонить (только admin)
        elif method == 'POST' and action == 'moderate':
            user = get_user_from_token(cur, token)
            if not user or user[1] != 'admin':
                return err(403, 'Нет доступа')

            mfr_id = body.get('manufacturer_id')
            status = body.get('status')
            reason = body.get('reason', '')

            if not mfr_id or status not in ('approved', 'rejected'):
                return err(400, 'Укажите manufacturer_id и status (approved/rejected)')

            cur.execute(
                f"UPDATE {SCHEMA}.manufacturers SET status=%s, reject_reason=%s, updated_at=now() WHERE id=%s",
                (status, reason, mfr_id)
            )
            db.commit()
            return ok({'success': True})

        else:
            return err(404, 'Не найдено')

    finally:
        cur.close()
        db.close()
