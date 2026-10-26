const APP_VERSION="KGU · 1.0";
const CARD_TEMPLATES = {
  "default": {
    "id": "default",
    "name": "열린 캠퍼스",
    "description": "공식 UI의 열린 문에서 착안한 삼색 프레임",
    "background": "assets/default.svg",
    "thumbnail": "previews/default.png",
    "layout": {
      "width": 2048,
      "height": 706,
      "logos": {
        "kyonggi": {
          "src": "assets/logo.png",
          "x": 1580,
          "y": 45,
          "w": 370,
          "h": 100
        }
      },
      "name": {
        "x": 110,
        "y": 155,
        "maxWidth": 780,
        "startSize": 112,
        "minSize": 42,
        "color": "#215292"
      },
      "title": {
        "x": 900,
        "y": 245,
        "maxWidth": 260,
        "startSize": 48,
        "minSize": 34,
        "color": "#333333"
      },
      "teamWithWork": {
        "x": 110,
        "y": 315,
        "maxWidth": 1330,
        "startSize": 42,
        "minSize": 22,
        "color": "#333333"
      },
      "teamWithoutWork": {
        "x": 110,
        "y": 330,
        "maxWidth": 1330,
        "startSize": 42,
        "minSize": 22,
        "color": "#333333"
      },
      "work": {
        "x": 110,
        "y": 375,
        "maxWidth": 1330,
        "startSize": 30,
        "minSize": 16,
        "color": "#555555"
      },
      "et": {
        "x": 110,
        "emailY": 450,
        "phoneY": 515,
        "size": 35,
        "color": "#215292"
      },
      "email": {
        "x": 175,
        "y": 450,
        "maxWidth": 1200,
        "startSize": 37,
        "minSize": 22,
        "color": "#253247"
      },
      "phone": {
        "x": 175,
        "y": 515,
        "maxWidth": 1200,
        "startSize": 37,
        "minSize": 22,
        "color": "#253247"
      },
      "addressWithWork": {
        "x": 110,
        "y": 610,
        "maxWidth": 1390,
        "startSize": 32,
        "minSize": 18,
        "color": "#253247"
      },
      "addressWithoutWork": {
        "x": 110,
        "y": 610,
        "maxWidth": 1390,
        "startSize": 32,
        "minSize": 18,
        "color": "#253247"
      },
      "characterBox": {
        "x": 1590,
        "y": 190,
        "w": 310,
        "h": 380
      },
      "nameTitleGap": 24
    }
  },
  "garden": {
    "id": "garden",
    "name": "기룡이 가든",
    "description": "연두빛 패널과 기룡이의 친근한 캠퍼스",
    "background": "assets/garden.svg",
    "thumbnail": "previews/garden.png",
    "layout": {
      "width": 2048,
      "height": 706,
      "logos": {
        "kyonggi": {
          "src": "assets/logo.png",
          "x": 1580,
          "y": 45,
          "w": 370,
          "h": 100
        }
      },
      "name": {
        "x": 110,
        "y": 155,
        "maxWidth": 780,
        "startSize": 112,
        "minSize": 42,
        "color": "#215292"
      },
      "title": {
        "x": 900,
        "y": 245,
        "maxWidth": 260,
        "startSize": 48,
        "minSize": 34,
        "color": "#333333"
      },
      "teamWithWork": {
        "x": 110,
        "y": 315,
        "maxWidth": 1330,
        "startSize": 42,
        "minSize": 22,
        "color": "#333333"
      },
      "teamWithoutWork": {
        "x": 110,
        "y": 330,
        "maxWidth": 1330,
        "startSize": 42,
        "minSize": 22,
        "color": "#333333"
      },
      "work": {
        "x": 110,
        "y": 375,
        "maxWidth": 1330,
        "startSize": 30,
        "minSize": 16,
        "color": "#555555"
      },
      "et": {
        "x": 110,
        "emailY": 450,
        "phoneY": 515,
        "size": 35,
        "color": "#215292"
      },
      "email": {
        "x": 175,
        "y": 450,
        "maxWidth": 1200,
        "startSize": 37,
        "minSize": 22,
        "color": "#253247"
      },
      "phone": {
        "x": 175,
        "y": 515,
        "maxWidth": 1200,
        "startSize": 37,
        "minSize": 22,
        "color": "#253247"
      },
      "addressWithWork": {
        "x": 110,
        "y": 610,
        "maxWidth": 1390,
        "startSize": 32,
        "minSize": 18,
        "color": "#253247"
      },
      "addressWithoutWork": {
        "x": 110,
        "y": 610,
        "maxWidth": 1390,
        "startSize": 32,
        "minSize": 18,
        "color": "#253247"
      },
      "characterBox": {
        "x": 1590,
        "y": 190,
        "w": 310,
        "h": 380
      },
      "nameTitleGap": 24
    }
  },
  "ribbon": {
    "id": "ribbon",
    "name": "블루 리본",
    "description": "단정한 리본과 넓은 여백의 업무형",
    "background": "assets/ribbon.svg",
    "thumbnail": "previews/ribbon.png",
    "layout": {
      "width": 2048,
      "height": 706,
      "logos": {
        "kyonggi": {
          "src": "assets/logo.png",
          "x": 1580,
          "y": 45,
          "w": 370,
          "h": 100
        }
      },
      "name": {
        "x": 190,
        "y": 155,
        "maxWidth": 780,
        "startSize": 112,
        "minSize": 42,
        "color": "#215292"
      },
      "title": {
        "x": 980,
        "y": 245,
        "maxWidth": 260,
        "startSize": 48,
        "minSize": 34,
        "color": "#333333"
      },
      "teamWithWork": {
        "x": 110,
        "y": 315,
        "maxWidth": 1330,
        "startSize": 42,
        "minSize": 22,
        "color": "#333333"
      },
      "teamWithoutWork": {
        "x": 110,
        "y": 330,
        "maxWidth": 1330,
        "startSize": 42,
        "minSize": 22,
        "color": "#333333"
      },
      "work": {
        "x": 110,
        "y": 375,
        "maxWidth": 1330,
        "startSize": 30,
        "minSize": 16,
        "color": "#555555"
      },
      "et": {
        "x": 110,
        "emailY": 450,
        "phoneY": 515,
        "size": 35,
        "color": "#215292"
      },
      "email": {
        "x": 175,
        "y": 450,
        "maxWidth": 1200,
        "startSize": 37,
        "minSize": 22,
        "color": "#253247"
      },
      "phone": {
        "x": 175,
        "y": 515,
        "maxWidth": 1200,
        "startSize": 37,
        "minSize": 22,
        "color": "#253247"
      },
      "addressWithWork": {
        "x": 110,
        "y": 610,
        "maxWidth": 1390,
        "startSize": 32,
        "minSize": 18,
        "color": "#253247"
      },
      "addressWithoutWork": {
        "x": 110,
        "y": 610,
        "maxWidth": 1390,
        "startSize": 32,
        "minSize": 18,
        "color": "#253247"
      },
      "characterBox": {
        "x": 1570,
        "y": 210,
        "w": 310,
        "h": 360
      },
      "nameTitleGap": 24
    }
  },
  "postcard": {
    "id": "postcard",
    "name": "캠퍼스 포스트",
    "description": "엽서 구도와 따뜻한 코랄 포인트",
    "background": "assets/postcard.svg",
    "thumbnail": "previews/postcard.png",
    "layout": {
      "width": 2048,
      "height": 706,
      "logos": {
        "kyonggi": {
          "src": "assets/logo.png",
          "x": 110,
          "y": 55,
          "w": 370,
          "h": 100
        }
      },
      "name": {
        "x": 520,
        "y": 155,
        "maxWidth": 800,
        "startSize": 112,
        "minSize": 42,
        "color": "#215292"
      },
      "title": {
        "x": 1310,
        "y": 245,
        "maxWidth": 230,
        "startSize": 48,
        "minSize": 34,
        "color": "#333333"
      },
      "teamWithWork": {
        "x": 520,
        "y": 315,
        "maxWidth": 920,
        "startSize": 42,
        "minSize": 22,
        "color": "#333333"
      },
      "teamWithoutWork": {
        "x": 520,
        "y": 330,
        "maxWidth": 920,
        "startSize": 42,
        "minSize": 22,
        "color": "#333333"
      },
      "work": {
        "x": 520,
        "y": 375,
        "maxWidth": 920,
        "startSize": 30,
        "minSize": 16,
        "color": "#555555"
      },
      "et": {
        "x": 520,
        "emailY": 450,
        "phoneY": 515,
        "size": 35,
        "color": "#215292"
      },
      "email": {
        "x": 585,
        "y": 450,
        "maxWidth": 790,
        "startSize": 37,
        "minSize": 22,
        "color": "#253247"
      },
      "phone": {
        "x": 585,
        "y": 515,
        "maxWidth": 790,
        "startSize": 37,
        "minSize": 22,
        "color": "#253247"
      },
      "addressWithWork": {
        "x": 520,
        "y": 610,
        "maxWidth": 980,
        "startSize": 32,
        "minSize": 18,
        "color": "#253247"
      },
      "addressWithoutWork": {
        "x": 520,
        "y": 610,
        "maxWidth": 980,
        "startSize": 32,
        "minSize": 18,
        "color": "#253247"
      },
      "characterBox": {
        "x": 110,
        "y": 210,
        "w": 300,
        "h": 340
      },
      "nameTitleGap": 24
    }
  }
};
