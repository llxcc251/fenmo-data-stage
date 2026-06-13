import json, os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

def load_json(name):
    with open(os.path.join(DATA_DIR, name), encoding='utf-8') as f:
        return json.load(f)

@app.route('/api/plays')
def get_plays():
    plays = load_json('plays.json')
    # Optional filters
    genre = request.args.get('genre')
    dynasty = request.args.get('dynasty')
    search = request.args.get('search', '').lower()
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 100))

    if search:
        plays = [p for p in plays if search in p['title'].lower() or
                 any(search in a.lower() for a in p.get('altNames', []))]
    if genre:
        plays = [p for p in plays if genre in p.get('genres', [])]
    if dynasty:
        plays = [p for p in plays if p.get('dynasty') == dynasty]

    total = len(plays)
    start = (page - 1) * limit
    return jsonify({'total': total, 'page': page, 'data': plays[start:start+limit]})

@app.route('/api/roles')
def get_roles():
    roles = load_json('roles.json')
    category = request.args.get('category')
    limit = int(request.args.get('limit', 500))
    if category:
        roles = [r for r in roles if r.get('category') == category]
    return jsonify({'total': len(roles), 'data': roles[:limit]})

@app.route('/api/melodies')
def get_melodies():
    return jsonify(load_json('melodies.json'))

@app.route('/api/relations')
def get_relations():
    relations = load_json('relations.json')
    play = request.args.get('play')
    role = request.args.get('role')
    if play:
        relations = [r for r in relations if r['play'] == play]
    if role:
        relations = [r for r in relations if r['role'] == role]
    return jsonify({'total': len(relations), 'data': relations})

@app.route('/api/stats')
def get_stats():
    plays = load_json('plays.json')
    roles = load_json('roles.json')
    melodies = load_json('melodies.json')
    relations = load_json('relations.json')
    return jsonify({
        'totalPlays': len(plays),
        'totalRoles': len(roles),
        'totalMelodies': len(melodies),
        'totalRelations': len(relations),
        'uniqueDynasties': len(set(p.get('dynasty', '未知') for p in plays)),
        'uniqueRoleTypes': len(set(r.get('type', '') for r in roles if r.get('type'))),
    })

@app.route('/api/overview')
def get_overview():
    plays = load_json('plays.json')
    dynasty_count = {}
    genre_count = {}
    for p in plays:
        d = p.get('dynasty', '未知')
        dynasty_count[d] = dynasty_count.get(d, 0) + 1
        for g in p.get('genres', ['其他']):
            genre_count[g] = genre_count.get(g, 0) + 1
    return jsonify({
        'dynastyCount': dict(sorted(dynasty_count.items(), key=lambda x: -x[1])),
        'genreCount': dict(sorted(genre_count.items(), key=lambda x: -x[1])),
    })

@app.route('/api/role-types')
def get_role_types():
    roles = load_json('roles.json')
    by_category = {'生': 0, '旦': 0, '净': 0, '丑': 0}
    by_type = {}
    for r in roles:
        cat = r.get('category', '其他')
        if cat in by_category:
            by_category[cat] += 1
        rt = r.get('type', '')
        if rt:
            by_type[rt] = by_type.get(rt, 0) + 1
    return jsonify({
        'byCategory': by_category,
        'byType': dict(sorted(by_type.items(), key=lambda x: -x[1])),
    })

@app.route('/api/melody-stats')
def get_melody_stats():
    melodies = load_json('melodies.json')
    plays = load_json('plays.json')
    pattern_count = {}
    for p in plays:
        for pt in p.get('patterns', []):
            pattern_count[pt] = pattern_count.get(pt, 0) + 1
    return jsonify({
        'melodies': melodies,
        'patternCount': dict(sorted(pattern_count.items(), key=lambda x: -x[1])),
    })

@app.route('/api/heritage')
def get_heritage():
    plays = load_json('plays.json')
    source_count = {}
    dynasty_order = ['商', '周', '春秋', '战国', '秦', '汉', '三国', '晋', '南北朝',
                     '隋', '唐', '五代', '宋', '元', '明', '清']
    dynasty_timeline = []
    for d in dynasty_order:
        count = sum(1 for p in plays if p.get('dynasty') == d)
        if count > 0:
            dynasty_timeline.append({'name': d, 'value': count})
    for p in plays:
        s = p.get('source', '未标注来源')
        source_count[s] = source_count.get(s, 0) + 1
    return jsonify({
        'dynastyTimeline': dynasty_timeline,
        'sourceCount': dict(sorted(source_count.items(), key=lambda x: -x[1])),
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
