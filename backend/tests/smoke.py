#!/usr/bin/env python3
"""تست دودی API (بدون وابستگی). اجرا: python3 tests/smoke.py [http://127.0.0.1:8080] [uploads_dir]
فرض: دیتابیس با 001 و 002 پر شده و ادمین admin@example.com / long-password-123 وجود دارد.
جدول login_attempts در پایان با mysql پاک می‌شود (اگر mysql در PATH باشد)."""
import http.client, json, os, subprocess, sys, uuid, io
from urllib.parse import urlparse
BASE = urlparse(sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8080')
UP = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), '..', 'uploads')
cookie, csrf, ok, bad = {}, None, 0, 0

def call(method, path, body=None, headers=None, raw=None, ctype='application/json', auth=True):
    h = dict(headers or {})
    if auth and cookie: h['Cookie'] = '; '.join(f'{k}={v}' for k, v in cookie.items())
    if auth and csrf and method != 'GET': h['X-CSRF-Token'] = csrf
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    if data is not None: h['Content-Type'] = ctype
    c = http.client.HTTPConnection(BASE.hostname, BASE.port, timeout=30)
    c.request(method, '/api' + path, data, h)
    r = c.getresponse(); txt = r.read().decode()
    for k, v in r.getheaders():
        if k.lower() == 'set-cookie':
            n, _, rest = v.partition('='); cookie[n] = rest.split(';')[0]
            r.setcookie = v
    try: j = json.loads(txt) if txt else None
    except Exception: j = None
    return r.status, j, r

def t(name, cond, extra=''):
    global ok, bad
    if cond: ok += 1; print('  ok  ', name)
    else: bad += 1; print('  FAIL', name, extra)

def login(pw='long-password-123', email='admin@example.com'):
    global csrf
    s, j, r = call('POST', '/auth/login', {'email': email, 'password': pw}, auth=False)
    if s == 200: csrf = j['data']['csrfToken']
    return s, j, r

print('== هسته')
s, j, r = call('GET', '/nope'); t('404 JSON', s == 404 and j['statusCode'] == 404)
s, j, r = call('DELETE', '/health'); t('405 + Allow', s == 405 and 'GET' in (r.getheader('Allow') or ''))
s, j, r = call('POST', '/auth/login', raw=b'{bad', ctype='application/json'); t('JSON خراب 400', s == 400)
s, j, r = call('POST', '/auth/login', raw=b'x=1', ctype='text/plain'); t('Content-Type غلط 415', s == 415)
s, j, r = call('POST', '/auth/login', raw=b'{"a":"' + b'x' * 1100000 + b'"}'); t('بدنه‌ی بزرگ 413', s == 413)
s, j, r = call('GET', '/health'); t('no-store روی پاسخ', r.getheader('Cache-Control') == 'no-store')
s, j, r = call('GET', '/config/config.php'); t('دسترسی مستقیم config نشت نمی‌کنه', s in (403, 404) and 'cafepass' not in json.dumps(j))
s, j, r = call('GET', '/src/bootstrap.php'); t('دسترسی مستقیم bootstrap', s in (403, 404))

print('== احراز هویت')
s, j, r = call('GET', '/admin/categories', auth=False); t('بدون لاگین 401', s == 401)
s1, j1, _ = login('wrong-password-xx', 'admin@example.com')
s2, j2, _ = login('wrong-password-xx', 'nobody@example.com')
t('پیام یکسان برای ایمیل/رمز غلط', s1 == s2 == 401 and j1['message'] == j2['message'], (j1, j2))
cookie.clear()
s, j, r = login(); t('لاگین موفق', s == 200 and 'csrfToken' in j['data'])
sc = getattr(r, 'setcookie', '')
t('کوکی HttpOnly + SameSite=Lax', 'HttpOnly' in sc and 'SameSite=Lax' in sc, sc)
sid1 = cookie.get('cm_sid')
s, j, r = call('GET', '/auth/me'); t('me', s == 200 and j['data']['admin']['email'] == 'admin@example.com')
saved = csrf; csrf = None
s, j, r = call('POST', '/admin/categories', {'title': 'x'}); t('POST بدون CSRF → 403', s == 403)
csrf = 'bad' * 20
s, j, r = call('POST', '/admin/categories', {'title': 'x'}); t('CSRF غلط → 403', s == 403)
csrf = saved
s, j, r = call('POST', '/admin/categories', {'title': 'x'}, headers={'Origin': 'http://evil.example'}); t('Origin بیگانه → 403', s == 403)

print('== دسته‌ها')
s, j, r = call('POST', '/admin/categories', {'title': '  دسته   تست  '}); t('ساخت دسته (trim/فشرده)', s == 201 and j['data']['title'] == 'دسته تست', j)
cid = j['data']['id']
s, j, _ = call('POST', '/admin/categories', {'title': ''}); t('عنوان خالی 422', s == 422 and 'title' in j['errors'])
s, j, _ = call('POST', '/admin/categories', {'title': 'a' * 101}); t('عنوان ۱۰۱ کاراکتر 422', s == 422)
s, j, _ = call('PATCH', f'/admin/categories/{cid}', {'isActive': False}); t('PATCH isActive', s == 200 and j['data']['isActive'] is False)
s, j, _ = call('PATCH', '/admin/categories/99999', {'title': 'x'}); t('دسته‌ی ناموجود 404', s == 404)
s, j, _ = call('POST', f'/admin/categories/{cid}', {'title': 'با override'}, headers={'X-HTTP-Method-Override': 'PATCH'}); t('Method override', s == 200 and j['data']['title'] == 'با override')
s, j, _ = call('GET', '/admin/categories'); ids = [c['id'] for c in j['data']]; t('لیست با itemCount', s == 200 and all('itemCount' in c for c in j['data']))
s, j, _ = call('PUT', '/admin/categories/reorder', {'ids': ids[:-1]}); t('reorder ناقص 422', s == 422)
s, j, _ = call('PUT', '/admin/categories/reorder', {'ids': ids + [99999]}); t('reorder id غریبه 422', s == 422)
s, j, _ = call('PUT', '/admin/categories/reorder', {'ids': ids + ids[:1]}); t('reorder تکراری 422', s == 422)
s, j, _ = call('PUT', '/admin/categories/reorder', {'ids': list(reversed(ids))}); t('reorder درست 204', s == 204)
s, j, _ = call('GET', '/admin/categories'); t('ترتیب جدید اعمال شد', [c['id'] for c in j['data']] == list(reversed(ids)))

print('== آیتم‌ها')
base = {'categoryId': cid, 'title': 'آیتم تست', 'price': 50000}
s, j, _ = call('POST', '/admin/items', base); t('ساخت آیتم', s == 201 and j['data']['price'] == 50000 and j['data']['image'] is None, j)
iid = j['data']['id']
for name, patch in [('قیمت ۰', {'price': 0}), ('قیمت اعشاری', {'price': 10.5}), ('قیمت متنی', {'price': 'abc'}), ('قیمت بزرگ‌تر از حد', {'price': 100000000}),
                    ('بدون categoryId', {'categoryId': None}), ('دسته‌ی ناموجود', {'categoryId': 99999}), ('نام ۱۲۱ کاراکتر', {'title': 'a' * 121}),
                    ('توضیح ۵۰۱ کاراکتر', {'description': 'a' * 501}), ('نام عکس نامعتبر', {'image': '../../etc/passwd'}), ('عکس ناموجود', {'image': 'a' * 24 + '.webp'})]:
    b = {**base, **patch}
    if patch.get('categoryId', 1) is None: b.pop('categoryId')
    s, j, _ = call('POST', '/admin/items', b); t(f'اعتبارسنجی: {name} → 422', s == 422, (s, j))
s, j, _ = call('PATCH', f'/admin/items/{iid}', {'price': 75000}); t('PATCH قیمت', s == 200 and j['data']['price'] == 75000)
s, j, _ = call('PATCH', f'/admin/items/{iid}/availability', {'isAvailable': False}); t('availability', s == 200 and j['data']['isAvailable'] is False)
s, j, _ = call('PATCH', f'/admin/items/{iid}/availability', {'isAvailable': 'no'}); t('availability غیر bool 422', s == 422)
s, j, _ = call('GET', f'/admin/items?categoryId={cid}'); t('فیلتر categoryId', s == 200 and [i['id'] for i in j['data']] == [iid])
s, j, _ = call('POST', '/admin/items', {**base, 'title': 'دومی'}); iid2 = j['data']['id']
s, j, _ = call('PUT', '/admin/items/reorder', {'categoryId': cid, 'ids': [iid2, iid]}); t('reorder آیتم‌ها', s == 204)
s, j, _ = call('PUT', '/admin/items/reorder', {'categoryId': cid, 'ids': [iid2, 1]}); t('reorder آیتم غریبه 422', s == 422)

print('== منوی عمومی (زنده)')
s, j, r = call('GET', '/public/menu', auth=False); titles = [c['title'] for c in j['data']['categories']]
t('دسته‌ی غیرفعال نیست', 'با override' not in titles); t('no-store', r.getheader('Cache-Control') == 'no-store')
call('PATCH', f'/admin/categories/{cid}', {'isActive': True})
s, j, _ = call('GET', '/public/menu', auth=False); cat = next((c for c in j['data']['categories'] if c['id'] == cid), None)
t('بلافاصله بعد از تغییر دیده می‌شه + ترتیب', cat is not None and [i['id'] for i in cat['items']] == [iid2, iid] and cat['items'][1]['isAvailable'] is False)
t('کلیدهای آیتم مطابق قرارداد', set(cat['items'][0]) == {'id', 'title', 'description', 'price', 'image', 'thumb', 'isAvailable', 'isFeatured'})
call('POST', '/admin/categories', {'title': 'خالی'}); s, j, _ = call('GET', '/public/menu', auth=False)
t('دسته‌ی خالی نمایش داده نمی‌شه', 'خالی' not in [c['title'] for c in j['data']['categories']])

print('== آپلود عکس')
php = lambda code: subprocess.run(['php', '-r', code], capture_output=True).stdout
def mp(fields, fname, data, mime='image/jpeg'):
    b = '----' + uuid.uuid4().hex; out = b''
    for k, v in fields.items(): out += f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    out += f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="{fname}"\r\nContent-Type: {mime}\r\n\r\n'.encode() + data + f'\r\n--{b}--\r\n'.encode()
    return out, f'multipart/form-data; boundary={b}'
def up(fname, data, typ='item', mime='image/jpeg'):
    raw, ct = mp({'type': typ}, fname, data, mime); return call('POST', '/admin/upload', raw=raw, ctype=ct)
big = php('$i=imagecreatetruecolor(4000,3000);for($y=0;$y<3000;$y+=10)for($x=0;$x<4000;$x+=10)imagefilledrectangle($i,$x,$y,$x+9,$y+9,imagecolorallocate($i,$x%256,$y%256,($x+$y)%256));ob_start();imagejpeg($i,null,95);echo ob_get_clean();')
s, j, _ = up('photo.jpg', big); t('JPEG بزرگ → WebP', s == 201 and j['data']['image'].endswith('.webp'), (s, j))
img = j['data']['image']; main = os.path.join(UP, img); thumb = main.replace('.webp', '_t.webp')
if s == 201:
    sz = php(f'$s=getimagesize("{main}");echo $s[0]."x".$s[1]."|".filesize("{main}");').decode().split('|')
    t('خروجی ۸۰۰×۶۰۰ و زیر ۱۵۰KB', sz[0] == '800x600' and int(sz[1]) < 150_000, sz)
    t('thumb ساخته شد', os.path.isfile(thumb))
s, j, _ = up('shell.jpg', b'<?php echo 1; ?>', mime='image/jpeg'); t('PHP با پسوند jpg رد می‌شه', s in (415, 422), (s, j))
huge = php('$i=imagecreatetruecolor(8100,50);ob_start();imagepng($i);echo ob_get_clean();')
s, j, _ = up('huge.png', huge, mime='image/png'); t('ابعاد بیش از حد 422', s == 422, (s, j))
logo = php('$i=imagecreatetruecolor(1000,500);imagealphablending($i,false);imagesavealpha($i,true);imagefill($i,0,0,imagecolorallocatealpha($i,10,20,30,127));ob_start();imagepng($i);echo ob_get_clean();')
s, j, _ = up('logo.png', logo, 'logo', 'image/png'); t('لوگوی PNG', s == 201, (s, j))
if s == 201:
    lf = os.path.join(UP, j['data']['image'])
    info = php(f'$s=getimagesize("{lf}");$i=imagecreatefromwebp("{lf}");echo $s[0]."x".$s[1]."|".((imagecolorat($i,5,5)>>24)&127);').decode().split('|')
    t('لوگو contain در ۵۱۲ و شفافیت حفظ شد', info[0] == '512x256' and int(info[1]) > 100, info)
s, j, _ = call('POST', '/admin/upload', raw=mp({'type': 'item'}, 'a.jpg', big)[0] * 0 + b'', ctype='multipart/form-data; boundary=x'); t('آپلود بدون فایل 4xx', 400 <= s < 500)
print('  تعویض/حذف عکس:')
s, j, _ = call('PATCH', f'/admin/items/{iid}', {'image': img}); t('اتصال عکس به آیتم', s == 200 and j['data']['image'] == '/uploads/' + img)
s, j, _ = call('GET', '/public/menu', auth=False); it = next(i for c in j['data']['categories'] for i in c['items'] if i['id'] == iid)
t('thumb در منوی عمومی', it['thumb'] == '/uploads/' + img.replace('.webp', '_t.webp'))
big2 = php('$i=imagecreatetruecolor(1200,900);imagefill($i,0,0,imagecolorallocate($i,200,100,50));ob_start();imagejpeg($i);echo ob_get_clean();')
s, j, _ = up('p2.jpg', big2); img2 = j['data']['image']
s, j, _ = call('PATCH', f'/admin/items/{iid}', {'image': img2}); t('تعویض عکس', s == 200)
t('فایل قدیمی پاک شد', not os.path.isfile(main) and not os.path.isfile(thumb))
s, j, _ = call('DELETE', f'/admin/categories/{cid}'); t('حذف دسته 204', s == 204)
t('عکس‌های آیتم‌های دسته پاک شدند', not os.path.isfile(os.path.join(UP, img2)))
s, j, _ = call('GET', f'/admin/items/{iid}'); t('آیتم‌ها هم رفتن', s == 404)

print('== تنظیمات و رمز')
s, j, _ = call('PATCH', '/admin/settings', {'themeColor': 'red'}); t('رنگ نامعتبر 422', s == 422)
s, j, _ = call('PATCH', '/admin/settings', {'instagram': '@bad url'}); t('اینستاگرام نامعتبر 422', s == 422)
s, j, _ = call('PATCH', '/admin/settings', {'phone': 'abc'}); t('تلفن نامعتبر 422', s == 422)
s, j, _ = call('PATCH', '/admin/settings', {'themeColor': '#112233', 'instagram': 'ferea.cafe', 'workingHours': '۸ تا ۲۳'}); t('تنظیمات ذخیره', s == 200 and j['data']['themeColor'] == '#112233')
s, j, _ = call('PATCH', '/admin/settings', {'themeColor': '#6e3416'})
s, j, _ = call('PATCH', '/admin/password', {'currentPassword': 'long-password-123', 'newPassword': 'short'}); t('رمز کوتاه 422', s == 422)
s, j, _ = call('PATCH', '/admin/password', {'currentPassword': 'long-password-123', 'newPassword': 'long-password-123'}); t('رمز جدید = فعلی 422', s == 422)
s, j, _ = call('PATCH', '/admin/password', {'currentPassword': 'wrong-one-123456', 'newPassword': 'another-long-pass-1'}); t('رمز فعلی غلط 422', s == 422)

print('== logout و rate limit')
s, j, _ = call('POST', '/auth/logout'); t('logout 204', s == 204)
s, j, _ = call('GET', '/admin/categories'); t('بعد از logout 401', s == 401)
cookie.clear(); s, j, r = login(); t('session id عوض شد', cookie.get('cm_sid') != sid1)
cookie.clear()
codes = [login('nope-nope-nope')[0] for _ in range(5)]; s, j, r = login('nope-nope-nope')
t('۶مین تلاش ناموفق → 429 + Retry-After', codes == [401] * 5 and s == 429 and int(r.getheader('Retry-After') or 0) > 0, (codes, s))
s, j, r = login(); t('حتی رمز درست هم موقتاً بلاک', s == 429)
try: subprocess.run(['mysql', 'cafe_menu', '-e', 'DELETE FROM login_attempts'], check=True)
except Exception: print('  (login_attempts را دستی پاک کن)')
print(f'\n{ok} passed, {bad} failed'); sys.exit(1 if bad else 0)
