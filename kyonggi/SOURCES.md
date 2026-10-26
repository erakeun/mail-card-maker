# 경기대학교 메일 명함 에디션

독립 진입점: `/kyonggi/`. 기존 루트 한양대 앱 파일과 저장소는 변경하지 않았습니다. 학교 공식 서비스가 아닌 사용자 제작 도구입니다.

## 공식 출처 (2026-10-26 확인)

| 항목 | 공식 출처 | 사용 |
| --- | --- | --- |
| UI 및 시그니처 | https://www.kyonggi.ac.kr/www/contents.do?key=5093 | 국문 좌우조합 원본 PNG |
| 로고 원본 | https://www.kyonggi.ac.kr/site/www/images/contents/key5093_img03.png | `assets/logo.png`, 바이트 그대로 |
| UI 디자인 매뉴얼 | https://www.kyonggi.ac.kr/downloadContentsFile.do?fileNo=839&key=5093 | ZIP 내 `BS_UI.pdf` 시각 검토, BS-03·BS-06 등 |
| 기룡이·색상 규정 | https://www.kyonggi.ac.kr/www/contents.do?key=9819 | 기본형 6종, 정비례 확대·축소 규정 |
| 캐릭터 원본 ZIP | https://www.kyonggi.ac.kr/downloadContentsFile.do?fileNo=1918&key=9819 | `1.png`–`6.png`를 `giryong-1.png`–`giryong-6.png`로 이름만 변경 |
| 수원캠퍼스 주소 | https://www.kyonggi.ac.kr/www/contents.do?key=5146 | (16227) 경기도 수원시 영통구 광교산로 154-42 |
| 서울캠퍼스 주소 | https://www.kyonggi.ac.kr/www/contents.do?key=5147 | (03746) 서울특별시 서대문구 경기대로 9길 24 |

캐릭터 페이지의 HEX `#215292`, `#CAE3F6`, `#389D89`, `#EB7654`, `#F8A68F`, `#F0BEB2`, `#FEF3F2`를 장식 색상에 사용했습니다. `#389D89`는 페이지에 함께 기재된 RGB 숫자와 불일치하므로 명시된 HEX를 따랐습니다. 연한 패널 색상은 주변 배경을 위한 파생색이며 로고나 캐릭터를 재색상하지 않습니다.

## 자산 사용

UI 매뉴얼은 워드마크의 임의 색상·형태 변경, 구성요소 크기/위치 변경, 비정비례 확대, 기울이기, 테두리, 복잡한 패턴 배경을 금지합니다. 공식 PNG 전체를 정비례로 그리며, 원본 색상 및 파일 여백을 보존합니다. 기본 시안은 로고 주변에 빈 공간을 두고 흰 배경을 사용합니다. 공식 로고에는 사용자가 선택한 틴트를 적용하지 않습니다.

현재 기룡이는 현행 캐릭터 페이지에서 확인한 원본만 사용합니다. 구 UI 매뉴얼의 과거 캐릭터는 사용하지 않습니다. 정비례로 확대·축소하며 잘라내기, 좌우반전, 재색상을 하지 않습니다. 공식 ZIP은 페이지 설명상 원본 대비 20% 파일입니다. 5000px 등 큰 출력에서는 자산 자체의 해상도 한계가 있습니다.

배경 4종은 이 도구에서 만든 구성으로 학교 공식 명함 양식이 아닙니다. 공식 로고를 재구성한 것이 아니며 자산 저작권은 경기대학교에 있습니다. 배포가 포괄적인 상표·저작권 사용 허가를 의미하지 않습니다. 사용자가 이동/확대한 후에도 자산 주변 여백과 요소 간 겹침을 확인해야 합니다.

## 분리 및 유지보수

- 한양대 `index.html`, 스크립트, 이미지 및 저장 키 변경 없음. 경기대에 한양대 캐릭터 스크립트를 로드하지 않음.
- 경기대 IndexedDB `kyonggi-mail-card-maker-drafts`, localStorage `kyonggi-mail-card-maker-state-v1`, 편집파일 format `kyonggi-mail-card-maker` 사용. 다른 에디션 파일은 거부.
- 기존 canvas 편집·PNG 출력·이미지 업로드·저장 복원 구현을 전용 사본으로 재사용. 이후 공통 버그 수정 시 양쪽 에디션을 함께 검토해야 함. `../dot-picker.js`의 선택 동기화 헬퍼만 공유하며 도트 자산 목록은 로드하지 않음.
- 이름·직위·부서·전화·이메일은 가상 예시. 캠퍼스 변경 시 공식 주소를 채우고 직접 수정 가능.
- 한양대 의견 수집 `tool=01` 링크와 Google Analytics를 제거. 경기대 전용 의견 연결 전까지 전송 기능 미제공. 백엔드 변경 없음.
- 브랜치의 main 병합은 GitHub Pages 자동 운영 배포를 일으킴. 별도 운영 승인 전에는 merge하지 않음.

## 검증

`tests/kyonggi-smoke.cjs`는 독립 headless 브라우저·로컬 서버를 사용합니다. `PLAYWRIGHT_MODULE` 및 `CHROMIUM_EXECUTABLE` 환경 변수로 설치 경로를 지정할 수 있습니다. 결과는 `test-results/kyonggi/`에 저장됩니다. 기존 한양대 회귀는 `tests/dot-smoke.cjs`로 실행합니다. 사용자 Chrome 세션이나 물리 마우스를 사용하지 않습니다.
