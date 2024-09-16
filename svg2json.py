import xml.etree.ElementTree as ET
import json
import sys
import re

def parse_svg_path(d):
    commands = re.findall(r'([mlhvcsqtaz])([^mlhvcsqtaz]*)', d)
    path = []
    current_point = [0, 0]

    for command, args in commands:
        args = list(map(float, re.findall(r'-?\d+\.?\d*', args)))

        if command == 'm':
            current_point[0] += args[0]
            current_point[1] += args[1]
            path.append({"x": current_point[0], "y": current_point[1]})
        elif command == 'l':
            current_point[0] += args[0]
            current_point[1] += args[1]
            path.append({"x": current_point[0], "y": current_point[1]})
        elif command == 'h':
            current_point[0] += args[0]
            path.append({"x": current_point[0], "y": current_point[1]})
        elif command == 'v':
            current_point[1] += args[0]
            path.append({"x": current_point[0], "y": current_point[1]})
        elif command == 'c':
            # 베지어 곡선의 제어점들도 추가
            for i in range(0, len(args), 2):
                x = current_point[0] + args[i]
                y = current_point[1] + args[i+1]
                path.append({"x": x, "y": y})
            current_point[0] += args[-2]
            current_point[1] += args[-1]
        elif command == 'z':
            if path:
                path.append(path[0])  # 경로 닫기

    return path

def svg_to_json(svg_file):
    tree = ET.parse(svg_file)
    root = tree.getroot()

    paths = []
    for path in root.findall('.//{http://www.w3.org/2000/svg}path'):
        d = path.get('d')
        if d:
            parsed_path = parse_svg_path(d)
            paths.append(parsed_path)

    result = {"paths": paths}
    return json.dumps(result, indent=2)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python svg2json.py input.svg output.json")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    json_data = svg_to_json(input_file)
    
    with open(output_file, 'w') as f:
        f.write(json_data)

    print(f"Converted {input_file} to {output_file}")
