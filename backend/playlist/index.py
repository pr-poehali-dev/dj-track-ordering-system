import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление текущим плейлистом - получение и добавление треков
    Args: event с httpMethod, body
    Returns: HTTP response с текущим плейлистом
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
            cur.execute("SELECT * FROM current_playlist ORDER BY added_at DESC LIMIT 10")
            playlist = cur.fetchall()
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps([dict(track) for track in playlist], default=str)
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
        track_name = body_data.get('track_name')
        artist = body_data.get('artist')
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("UPDATE current_playlist SET is_playing = false")
            cur.execute(
                "INSERT INTO current_playlist (track_name, artist, is_playing) VALUES (%s, %s, %s) RETURNING *",
                (track_name, artist, True)
            )
            new_track = cur.fetchone()
            conn.commit()
        
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(dict(new_track), default=str)
        }
    
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
