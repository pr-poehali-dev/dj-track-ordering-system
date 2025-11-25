import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление заказами треков - получение списка и создание новых заказов
    Args: event с httpMethod, body, queryStringParameters
    Returns: HTTP response с данными заказов
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    if method == 'GET':
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM track_orders ORDER BY created_at DESC")
            orders = cur.fetchall()
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps([dict(order) for order in orders], default=str)
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        track_name = body_data.get('track_name')
        artist = body_data.get('artist')
        customer_name = body_data.get('customer_name')
        customer_phone = body_data.get('customer_phone', '')
        tariff = body_data.get('tariff')
        price = body_data.get('price')
        has_celebration = body_data.get('has_celebration', False)
        celebration_text = body_data.get('celebration_text', '')
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "INSERT INTO track_orders (track_name, artist, customer_name, customer_phone, tariff, price, has_celebration, celebration_text) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *",
                (track_name, artist, customer_name, customer_phone, tariff, price, has_celebration, celebration_text)
            )
            new_order = cur.fetchone()
            conn.commit()
        
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(dict(new_order), default=str)
        }
    
    if method == 'PUT':
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
        order_id = body_data.get('id')
        status = body_data.get('status')
        payment_status = body_data.get('payment_status')
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "UPDATE track_orders SET status = %s, payment_status = %s WHERE id = %s RETURNING *",
                (status, payment_status, order_id)
            )
            updated_order = cur.fetchone()
            conn.commit()
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(dict(updated_order), default=str)
        }
    
    if method == 'DELETE':
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
        
        params = event.get('queryStringParameters', {})
        order_id = params.get('id')
        
        with conn.cursor() as cur:
            cur.execute("DELETE FROM track_orders WHERE id = %s", (order_id,))
            conn.commit()
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'success': True})
        }
    
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }