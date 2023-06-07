

stuff = {
    'sebastes': 804,
    'embio': 1420,
    'semicoss': 12,
    'phalcrocorax': 1,
    'enhydra': 12,
    'peromyscus': 41,
    "zalophus": 4,
    'stronglyocentrous':(28021+102),
    'pollicipes': 632,
    'halliotis':(27 + 63 + 1 + 44 + 15),
    'tegula':7,
    'lottia':36,
    'megathera': 2,
    'olivella': 4,
    # 'olivella beads': 2,
    # 'fishhooks': 40,
    # 'fishhook frags': 43,
    # 'quartz flakes': 16,
    # 'mainland flakes': 114,
    # 'charcoal':8
}

keys = reversed(sorted(stuff, key=lambda item:stuff[item]))

for key in keys:
    print(key,stuff[key])