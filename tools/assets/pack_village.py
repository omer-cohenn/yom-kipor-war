# the lead's pack: the wrecks (and later the village pieces) -> src/4f_data_village.js
import sys; sys.path.insert(0, '/home/claude/yk_assets/tools'); import os; os.chdir('/home/claude/yk_assets')
import mesh
from pack import Pack
pk = Pack('village')
OT = 'x2/oil-truck_tex/tex/'; BT = 'x2/Bus-Ruin_tex/tex/'; HH = 'x/Textures__1_/Textures/'
keep = lambda n: [p for p in mesh.load(n) if 'Grass' not in p['mat']['name'] and 'TrckGR' not in p['mat']['name']]
# the lorry came without its own texture: rusted, burnt steel over its uv islands (the hedgehog's rust)
pk.add('w_truck', parts=keep('Truck_fbx'), size=('x', 6.4), lods=[1800, 600, 200], tex={'*': {'map': HH + 'Hedgehog_Base_Color.png', 'nmap': HH + 'Hedgehog_Normal.png', 'rough': 0.9, 'color': 0x9a8f86}}, texsize=256)
pk.add('w_tanker', parts=keep('oil_truck_fbx'), size=('x', 6.4), lods=[1800, 600, 200], tex={'*': {'map': OT + 'oil-truck.tga', 'nmap': OT + 'oil-truckNrml.jpg', 'rough': 0.9}}, texsize=512)
pk.add('w_bus', parts=keep('Bus_Ruin_fbx'), size=('z', 10.2), lods=[2600, 800, 250], tex={'*': {'map': BT + 'Buss.tga', 'nmap': BT + 'BussNrml.jpg', 'rough': 0.9}}, texsize=512)
pk.write()
