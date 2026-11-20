"""unrar.py ARCHIVE OUTDIR - unpack a rar (or anything libarchive reads) through the system's libarchive, with no unrar installed."""
import ctypes, sys, os
la = ctypes.CDLL('libarchive.so.13'); la.archive_read_new.restype = ctypes.c_void_p; la.archive_entry_pathname.restype = ctypes.c_char_p; la.archive_entry_size.restype = ctypes.c_int64
la.archive_read_data.restype = ctypes.c_ssize_t; la.archive_read_data.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_size_t]
for f in ('archive_read_support_filter_all', 'archive_read_support_format_all', 'archive_read_next_header', 'archive_read_open_filename', 'archive_read_free', 'archive_entry_filetype'): getattr(la, f).argtypes = None
a = la.archive_read_new(); la.archive_read_support_filter_all(ctypes.c_void_p(a)); la.archive_read_support_format_all(ctypes.c_void_p(a))
assert la.archive_read_open_filename(ctypes.c_void_p(a), sys.argv[1].encode(), 10240) == 0, 'open failed'
e = ctypes.c_void_p(); out = sys.argv[2]
while la.archive_read_next_header(ctypes.c_void_p(a), ctypes.byref(e)) == 0:
    name = la.archive_entry_pathname(e).decode('utf-8', 'replace'); path = os.path.join(out, name)
    if name.endswith('/'): os.makedirs(path, exist_ok=True); continue
    os.makedirs(os.path.dirname(path) or out, exist_ok=True); buf = ctypes.create_string_buffer(1 << 20)
    with open(path, 'wb') as f:
        while True:
            n = la.archive_read_data(ctypes.c_void_p(a), buf, 1 << 20)
            if n <= 0: break
            f.write(buf.raw[:n])
    print(name, os.path.getsize(path))
la.archive_read_free(ctypes.c_void_p(a))
