import os
import re

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 替换 HTML 实体
    fixed_content = content.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    print(f"Fixed: {file_path}")

# 修复 src 目录下的所有 .tsx 和 .ts 文件
src_dir = '/Users/xiyutex/guanwang/src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            fix_file(os.path.join(root, file))
