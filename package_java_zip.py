# package_java_zip.py
import os
import zipfile
import shutil

print("Packaging UrbanFlow AI Java Code into zip file...")

root_dir = r"c:\Traffic analytical system"
zip_name_1 = "UrbanFlow-AI-Java-System.zip"
zip_name_2 = "Traffic-Analytical-System-Java.zip"

dest_zip_1 = os.path.join(root_dir, zip_name_1)
dest_zip_2 = os.path.join(root_dir, zip_name_2)
downloads_dir = r"C:\Users\PRADEEPKUMAR M\Downloads"
brain_dir = r"C:\Users\PRADEEPKUMAR M\.gemini\antigravity\brain\4e0d5fda-802d-44c1-a6a9-1b17412dbe1e"

# Files and directories to include in the clean Java distribution
include_dirs = ["java_system", "doc_assets"]
include_files = [
    "compile_java.bat",
    "run_java.bat",
    "run_java_server.bat",
    "README.md",
    ".gitignore"
]

def make_zip(out_path):
    with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Add root batch and readme files
        for f in include_files:
            fp = os.path.join(root_dir, f)
            if os.path.exists(fp):
                zf.write(fp, arcname=f)
                print(f"Added file: {f}")
        
        # Add directories recursively
        for d in include_dirs:
            dp = os.path.join(root_dir, d)
            if os.path.exists(dp):
                for dirpath, dirnames, filenames in os.walk(dp):
                    for filename in filenames:
                        file_full = os.path.join(dirpath, filename)
                        arc_rel = os.path.relpath(file_full, root_dir)
                        zf.write(file_full, arcname=arc_rel)
                print(f"Added directory tree: {d}")

make_zip(dest_zip_1)
make_zip(dest_zip_2)

# Copy to Downloads
if os.path.exists(downloads_dir):
    shutil.copy2(dest_zip_1, os.path.join(downloads_dir, zip_name_1))
    shutil.copy2(dest_zip_2, os.path.join(downloads_dir, zip_name_2))
    print(f"Copied zips to {downloads_dir}")

# Copy to brain artifact dir
if os.path.exists(brain_dir):
    shutil.copy2(dest_zip_1, os.path.join(brain_dir, zip_name_1))
    shutil.copy2(dest_zip_2, os.path.join(brain_dir, zip_name_2))
    print(f"Copied zips to {brain_dir}")

size_1 = os.path.getsize(dest_zip_1)
print(f"SUCCESS: Created {dest_zip_1} ({size_1:,} bytes)")
