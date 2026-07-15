"""
TourAPI 4.0 원본 JSON(서울) -> 프론트엔드용 슬림 JSON 변환 스크립트

원본 출처: 한국관광공사 Tour API v4 (공공누리 제3유형 - 출처표시+변경금지)
https://www.data.go.kr/data/15101578/openapi.do

원본 필드는 그대로 두고(변경 금지 조건), 이 스크립트는 프론트엔드에 필요한
필드만 골라 별도의 "뷰(view)"용 파일을 만든다. 원본 데이터 자체를 수정하지 않는다.
"""
import json
import os

SRC_DIR = "/mnt/user-data/uploads"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")

FILES = {
    "attractions": ("서울_관광지.json", "관광지"),
    "culture": ("서울_문화시설.json", "문화시설"),
    "festivals": ("서울_축제공연행사.json", "축제공연행사"),
    "leisure": ("서울_레포츠.json", "레포츠"),
    "shopping": ("서울_쇼핑.json", "쇼핑"),
    "lodging": ("서울_숙박.json", "숙박"),
    "courses": ("서울_여행코스.json", "여행코스"),
}

CATEGORY_ICON = {
    "attractions": "🏞️",
    "culture": "🏛️",
    "festivals": "🎪",
    "leisure": "🏃",
    "shopping": "🛍️",
    "lodging": "🏨",
    "courses": "🗺️",
}


def slim_item(item, category_key):
    try:
        lat = float(item.get("mapy") or 0) or None
        lng = float(item.get("mapx") or 0) or None
    except ValueError:
        lat, lng = None, None

    return {
        "id": item.get("contentid"),
        "typeId": item.get("contenttypeid"),
        "category": category_key,
        "title": item.get("title", "").strip(),
        "addr": (item.get("addr1") or "").strip(),
        "addrDetail": (item.get("addr2") or "").strip(),
        "tel": (item.get("tel") or "").strip(),
        "lat": lat,
        "lng": lng,
        "image": item.get("firstimage") or item.get("firstimage2") or "",
        "cls": [item.get("lclsSystm1", ""), item.get("lclsSystm2", ""), item.get("lclsSystm3", "")],
    }


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    summary = []
    for key, (filename, label) in FILES.items():
        path = os.path.join(SRC_DIR, filename)
        with open(path, encoding="utf-8") as f:
            raw = json.load(f)

        items = [slim_item(it, key) for it in raw.get("items", [])]
        has_coords = sum(1 for it in items if it["lat"] and it["lng"])

        out_path = os.path.join(OUT_DIR, f"{key}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "category": key,
                    "label": label,
                    "icon": CATEGORY_ICON[key],
                    "total": len(items),
                    "items": items,
                },
                f,
                ensure_ascii=False,
            )

        summary.append((key, label, len(items), has_coords, os.path.getsize(out_path)))

    # category index (light, no items) for nav/filter UI
    index = [
        {"key": k, "label": lbl, "icon": CATEGORY_ICON[k], "total": total}
        for k, lbl, total, _, _ in summary
    ]
    with open(os.path.join(OUT_DIR, "categories.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False)

    print(f"{'category':12} {'label':10} {'items':>7} {'w/coords':>9} {'size(KB)':>10}")
    for k, lbl, total, has_coords, size in summary:
        print(f"{k:12} {lbl:10} {total:7d} {has_coords:9d} {size/1024:10.1f}")


if __name__ == "__main__":
    main()
