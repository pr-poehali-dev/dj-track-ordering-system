import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление настройками диджея - статус приема заказов
    Args: event с httpMethod, body, headers
    Returns: HTTP response со статусом приема заказов
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    if method == 'GET':
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM dj_settings ORDER BY id DESC LIMIT 1")
            settings = cur.fetchone()
        
        conn.close()
        
        if not settings:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'is_accepting_orders': True})
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(dict(settings), default=str)
        }
    
    if method == 'POST':
        headers = event.get('headers', {})
        admin_auth = headers.get('x-admin-auth') or headers.get('X-Admin-Auth')
        admin_password = os.environ.get('ADMIN_PASSWORD')
        
        if not admin_auth or admin_auth != admin_password:
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        is_accepting = body_data.get('is_accepting_orders')
        promo_code = body_data.get('promo_code')
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if is_accepting is not None and promo_code is not None:
                cur.execute(
                    "UPDATE dj_settings SET is_accepting_orders = %s, promo_code = %s, updated_at = CURRENT_TIMESTAMP WHERE id = 1 RETURNING *",
                    (is_accepting, promo_code)
                )
            elif is_accepting is not None:
                cur.execute(
                    "UPDATE dj_settings SET is_accepting_orders = %s, updated_at = CURRENT_TIMESTAMP WHERE id = 1 RETURNING *",
                    (is_accepting,)
                )
            elif promo_code is not None:
                cur.execute(
                    "UPDATE dj_settings SET promo_code = %s, updated_at = CURRENT_TIMESTAMP WHERE id = 1 RETURNING *",
                    (promo_code,)
                )
            updated_settings = cur.fetchone()
            conn.commit()
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(dict(updated_settings), default=str)
        }
    
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }