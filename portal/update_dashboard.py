import sys

with open(r"c:\Users\ABM\Desktop\freelance\projet perso freelance\ibe construction\portal\dashboard.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

# find first <style> and last </style>
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "<style>" in line and start_idx == -1:
        start_idx = i
    if "</style>" in line:
        end_idx = i

if start_idx != -1 and end_idx != -1:
    before = lines[:start_idx]
    after = lines[end_idx + 1:]
    link = ['    <link rel="stylesheet" href="dashboard-premium.css">\n']
    new_lines = before + link + after
    
    with open(r"c:\Users\ABM\Desktop\freelance\projet perso freelance\ibe construction\portal\dashboard.html", "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print(f"Replaced lines {start_idx+1} to {end_idx+1} with a stylesheet link.")
else:
    print("Could not find style tags.")
