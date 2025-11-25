import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление тарифами - получение и редактирование цен и названий
    Args: event с httpMethod, body, headers
    Returns: HTTP response с данными тарифов
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    if method == 'GET':
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM tariff_prices ORDER BY price DESC")
            tariffs = cur.fetchall()
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps([dict(tariff) for tariff in tariffs], default=str)
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
        tariff_id = body_data.get('tariff_id')
        price = body_data.get('price')
        name = body_data.get('name')
        time_estimate = body_data.get('time_estimate')
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "UPDATE tariff_prices SET price = %s, name = %s, time_estimate = %s, updated_at = CURRENT_TIMESTAMP WHERE tariff_id = %s RETURNING *",
                (price, name, time_estimate, tariff_id)
            )
            updated_tariff = cur.fetchone()
            conn.commit()
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(dict(updated_tariff), default=str)
        }
    
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
