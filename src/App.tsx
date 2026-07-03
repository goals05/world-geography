import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Globe, Compass, Sun, Send, 
  X, GraduationCap, ArrowLeft, Star, 
  Sparkles, Info, Map, AlertTriangle, Eye, EyeOff,
  ExternalLink
} from 'lucide-react';
import { countriesData, Country } from './data/countries';

const mapWidth = 800;
const mapHeight = 550;

const getCoordinateRange = (coordStr: string): string => {
  if (!coordStr) return '';
  const match = coordStr.match(/(북위|남위|동경|서경)\s*(\d+)/);
  if (match) {
    const direction = match[1];
    const degrees = parseInt(match[2], 10);
    const min = Math.max(0, degrees - 3);
    const max = degrees + 3;
    return `${direction} ${min}~${max}° 사이`;
  }
  return coordStr;
};

const getEasyRegion = (region: string): { easyTitle: string; description: string } => {
  const mapping: Record<string, { easyTitle: string; description: string }> = {
    "북서아프리카 마그레브 산악지대": {
      easyTitle: "아프리카 북서쪽 산맥 지대",
      description: "'마그레브'는 아랍어로 '해가 지는 서쪽 땅'을 뜻해요. 바다 옆에 높고 험한 아틀라스 산맥이 솟아 있는 멋진 곳이랍니다."
    },
    "북동아프리카 나일강 사막 문명권": {
      easyTitle: "나일강 주변의 사막 지대",
      description: "세계에서 가장 긴 나일강 덕분에 주변에 비옥한 땅이 생겼어요. 하지만 강을 조금만 벗어나면 엄청나게 넓고 건조한 사하라 사막이 펼쳐져요."
    },
    "남서아프리카 대서양 연안 사구 및 중앙고원 사막": {
      easyTitle: "바닷가 모래언덕과 높은 사막 지대",
      description: "'사구'는 바람에 실려 쌓인 '모래언덕'이에요. 바다 바로 옆에 거대한 모래 언덕과 높은 고원의 사막이 함께 있는 신기한 곳이에요."
    },
    "남부아프리카 고원 및 연안 지대": {
      easyTitle: "높은 평원과 바닷가 지대",
      description: "가운데는 높고 평평한 땅(고원)으로 되어 있고, 바다와 만나는 주변은 깎아지른 듯한 가파른 절벽으로 이루어진 독특한 땅이에요."
    },
    "북아프리카 마그레브 해안림 및 중앙 사하라 사막지대": {
      easyTitle: "바닷가 숲과 넓은 사하라 사막",
      description: "바다 근처는 따뜻하고 나무가 자라지만, 안쪽으로 들어가면 세계에서 가장 크고 더운 모래 사막인 사하라 사막이 펼쳐집니다."
    },
    "서아프리카 기니만 충적 델타지대": {
      easyTitle: "서쪽 바닷가 넓은 강 하류 평야",
      description: "'충적 델타'는 강물이 실어 나른 비옥한 흙과 모래가 강 하류 바닷가에 쌓여서 만들어진 넓고 풍요로운 삼각주 평야를 말해요."
    },
    "동아프리카 대고원 산악 내륙권": {
      easyTitle: "동쪽의 높은 평원과 큰 산 지대",
      description: "바다에서 먼 내륙에 있는 아주 높고 넓은 평원이에요. 아프리카에서 가장 높은 킬리만자로산 같은 거대한 화산들이 솟아 있어요."
    },
    "동아프리카 연안 사바나 야생권": {
      easyTitle: "동쪽 바닷가와 넓은 풀밭 지대",
      description: "'사바나'는 건기가 있어서 키 작은 나무들과 긴 풀들이 자라는 넓은 초원이에요. 얼룩말과 사자 같은 야생 동물이 아주 많이 살아요."
    },
    "동아프리카 고원 및 지구대권": {
      easyTitle: "높은 평원과 갈라진 큰 골짜기",
      description: "'지구대'는 땅속의 거대한 힘 때문에 땅이 양옆으로 갈라지면서 생긴 깊고 긴 골짜기예요. 주변에 깊고 아름다운 호수들이 많답니다."
    },
    "북서유럽 그레이트브리튼 제도": {
      easyTitle: "북서쪽의 큰 섬나라 지대",
      description: "'제도'는 무리지어 있는 여러 섬들을 뜻해요. 영국과 아일랜드가 위치한 푸르고 온화한 섬들로 이루어진 지형이에요."
    },
    "중앙유럽 남고북저 지형권": {
      easyTitle: "남쪽은 높은 산, 북쪽은 평평한 지형",
      description: "'남고북저'는 '남쪽은 높고 북쪽은 낮다'는 뜻이에요. 남쪽에는 높은 알프스 산맥이 있고 북쪽에는 넓고 평평한 평야가 펼쳐져 있어요."
    },
    "남서유럽 이베리아 고원 지대": {
      easyTitle: "남서쪽의 넓고 높은 평원 지대",
      description: "스페인과 포르투갈이 있는 반도로, 대부분의 땅이 주변 바다보다 훨씬 높은 해발고도를 가진 거대한 고원과 산맥으로 이루어져 있어요."
    },
    "남동유럽 발칸반도 산악·군도지대": {
      easyTitle: "남동쪽의 산과 섬이 많은 지대",
      description: "'군도'는 무리지어 모여 있는 많은 섬들이예요. 울퉁불퉁한 산맥들이 바다 깊숙이 잠겨 그리스처럼 수많은 섬과 복잡한 해안선이 되었어요."
    },
    "중앙유럽 알프스 산악 내륙지대": {
      easyTitle: "유럽의 지붕 알프스 산맥 지대",
      description: "바다가 없는 내륙 한가운데에 위치해 있어요. 일 년 내외 얼음이 얼어있는 높은 알프스 산맥과 에메랄드빛 계곡이 가득한 웅장한 지형이에요."
    },
    "북대서양 판과 판이 벌어지는 지열 화산도": {
      easyTitle: "지각이 갈라지며 생긴 불과 얼음의 섬",
      description: "지구 표면을 이루는 단단한 판들이 서로 양쪽으로 벌어지는 곳이에요. 틈새로 마그마가 솟아올라 화산과 온천이 펄펄 끓는 섬이랍니다."
    },
    "북유럽 스칸디나비아 빙하지대": {
      easyTitle: "얼음 빙하가 깎아 만든 절벽과 골짜기",
      description: "옛날 추운 빙하기 시절에 엄청나게 거대한 얼음덩어리(빙하)가 땅을 누르고 깎으며 흘러가서 깊은 U자형 골짜기와 절벽 바닷길을 만들었어요."
    },
    "북유럽 스칸디나비아 침엽수 평원지대": {
      easyTitle: "뾰족뾰족 소나무 가득한 숲속 평원",
      description: "잎이 뾰족하고 추위에 강한 소나무와 전나무 같은 침엽수림(타이가)이 끝없이 펼쳐진, 평평하고 눈이 많이 내리는 북쪽 나라들의 지형이에요."
    },
    "남유럽 아펜니노 반도 및 지중해역": {
      easyTitle: "장화 모양 반도와 따뜻한 지중해 바닷가",
      description: "이탈리아 반도를 척추처럼 길게 가로지르는 아펜니노 산맥이 있고, 일 년 내내 따뜻한 햇살이 비치는 지중해 바다로 둘러싸인 아름다운 곳이에요."
    },
    "인도양 고립 독립 거대 섬 생태계": {
      easyTitle: "인도양 속 나홀로 외딴 거대 섬",
      description: "다른 대륙들과 아주 아주 오랫동안 떨어져 지냈기 때문에, 마다가스카르처럼 지구상 다른 어디에서도 볼 수 없는 희귀한 동물과 식물들이 가득해요."
    },
    "서유럽 대륙 평야 및 분지 지대": {
      easyTitle: "서쪽의 넓은 평야와 사발 모양 땅",
      description: "'분지'는 주변이 산으로 둘러싸여 한가운데가 사발처럼 오목하고 평평하게 들어간 땅이에요. 농사짓기에 최고로 좋은 넓고 기름진 땅이 많아요."
    },
    "사헬 사막 전이대 및 나일강 대합류 분지": {
      easyTitle: "사막 옆 건조한 풀밭과 큰 강들이 만나는 평지",
      description: "'사헬'은 사하라 사막의 남쪽 테두리로, 비가 적게 와서 사막으로 변해가는 건조한 풀밭 지대예요. 여러 큰 강들이 합쳐져 평지를 이루고 있어요."
    },
    "동유럽 대평원 및 발트해 연안 지대": {
      easyTitle: "동쪽의 끝없는 평야와 잔잔한 바닷가",
      description: "끝없이 아주 멀리까지 다 평평한 넓은 평야(대평원)가 이어지는 곳이에요. 북쪽에는 육지에 둘러싸여 파도가 잔잔한 발트해 바다가 있답니다."
    }
  };

  return mapping[region] || {
    easyTitle: region,
    description: "초등학교 지리 과정에서 만나는 아름답고 독특한 자연환경을 보여주는 지형입니다."
  };
};

const getLandmarkImageUrl = (countryId: string, index: number): string => {
  const images: Record<string, string[]> = {
    uk: [
      'https://images.unsplash.com/photo-1599833975787-5c143f373c30?auto=format&fit=crop&w=800&q=80', // Stonehenge
      'https://images.unsplash.com/photo-1549449272-359f14b62db4?auto=format&fit=crop&w=800&q=80', // Seven Sisters
      'https://images.unsplash.com/photo-1552554605-2b0e9f427771?auto=format&fit=crop&w=800&q=80'  // Giant's Causeway
    ],
    france: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', // Eiffel Tower
      'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=800&q=80', // Mont Blanc Alps peaks
      'https://images.unsplash.com/photo-1563286071-7058865c3639?auto=format&fit=crop&w=800&q=80'  // Mont Saint-Michel
    ],
    germany: [
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80', // Neuschwanstein Castle
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', // Black Forest
      'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80'  // Rhine Valley
    ],
    italy: [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', // Colosseum
      'https://images.unsplash.com/photo-1533588742-9988ffbc6355?auto=format&fit=crop&w=800&q=80', // Pompeii / Vesuvius
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80'  // Amalfi Coast
    ],
    spain: [
      'https://images.unsplash.com/photo-1583779457094-0eba34a19767?auto=format&fit=crop&w=800&q=80', // Sagrada Familia
      'https://images.unsplash.com/photo-1595171730413-5bc68b8e3a24?auto=format&fit=crop&w=800&q=80', // Alhambra
      'https://images.unsplash.com/photo-1616422312686-2580a1334994?auto=format&fit=crop&w=800&q=80'  // Montserrat
    ],
    greece: [
      'https://images.unsplash.com/photo-1608126976835-66cf88d4c948?auto=format&fit=crop&w=800&q=80', // Parthenon
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80', // Santorini
      'https://images.unsplash.com/photo-1558231580-0a8a7ca2c676?auto=format&fit=crop&w=800&q=80'  // Meteora
    ],
    norway: [
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80', // Geirangerfjord
      'https://images.unsplash.com/photo-1532541183144-88f50b4ec734?auto=format&fit=crop&w=800&q=80', // Lofoten
      'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=800&q=80'  // Northern Lights
    ],
    switzerland: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', // Matterhorn (Genuine iconic mountain peak with lake reflection)
      'https://images.unsplash.com/photo-1541845157-a6d2d100c931?auto=format&fit=crop&w=800&q=80', // Jungfraujoch (Genuine Swiss red cogwheel train on snowy Alps)
      'https://images.unsplash.com/photo-1527668752968-14dc70a27443?auto=format&fit=crop&w=800&q=80'  // Lake Geneva (Genuine spectacular Lake Geneva with Chillon Castle sunset)
    ],
    finland: [
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80', // Santa Claus Village (Cozy snowy Finnish cottage)
      'https://images.unsplash.com/photo-1527269537047-40fbe5034111?auto=format&fit=crop&w=800&q=80', // Lake Saimaa (Genuine blue forest lake)
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=800&q=80'  // Helsinki Cathedral (White cathedral green domes)
    ],
    iceland: [
      'https://images.unsplash.com/photo-1504893524553-ac55fce698be?auto=format&fit=crop&w=800&q=80', // Blue Lagoon geothermal springs
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80', // Geysir / waterfall scenery
      'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=800&q=80'  // Thingvellir rift valley
    ],
    egypt: [
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80', // Pyramids of Giza
      'https://images.unsplash.com/photo-1600577916048-804c9191e36c?auto=format&fit=crop&w=800&q=80', // Abu Simbel colossal facade
      'https://images.unsplash.com/photo-1590075865003-e48277adc5e8?auto=format&fit=crop&w=800&q=80'  // Nile River sunset
    ],
    algeria: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', // Tassili n'Ajjer
      'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80', // Hoggar Mountains volcanic spires
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80'  // Tipaza Roman Ruins on sea
    ],
    sudan: [
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80', // Meroe Pyramids
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', // Khartoum Nile Junction
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'  // Sabaloka Gorge
    ],
    nigeria: [
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80', // Zuma Rock
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80', // Lekki canopy green path
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80'  // Osun-Osogbo sacred forest
    ],
    namibia: [
      'https://images.unsplash.com/photo-1505322108101-e404be12cc45?auto=format&fit=crop&w=800&q=80', // Sossusvlei dunes
      'https://images.unsplash.com/photo-1510414842594-fc614ea9416f?auto=format&fit=crop&w=800&q=80', // Deadvlei authentic black skeleton trees and orange dunes
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'  // Fish River Canyon rock formations
    ],
    'south-africa': [
      'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80', // Table Mountain Cape Town
      'https://images.unsplash.com/photo-1568454537842-d933259bb258?auto=format&fit=crop&w=800&q=80', // Cape of Good Hope rugged cliff coastline
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80'  // Kruger National Park savanna acacia
    ],
    kenya: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80', // Maasai Mara safari giraffe
      'https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=800&q=80', // Mount Kenya peak and African savanna
      'https://images.unsplash.com/photo-1561571994-3c61c554181a?auto=format&fit=crop&w=800&q=80'  // Lake Nakuru flock of pink flamingos
    ],
    morocco: [
      'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=800&q=80', // Marrakech historical arches
      'https://images.unsplash.com/photo-1548135113-d1df525143a4?auto=format&fit=crop&w=800&q=80', // Chefchaouen blue city street
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'  // Merzouga Sahara dunes
    ],
    madagascar: [
      'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=800&q=80', // Baobab Avenue
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80', // Tsingy needle stones
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'  // Isalo Canyon
    ],
    ethiopia: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80', // Lalibela St. George Church
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80', // Simien Mountains cliffs
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'  // Blue Nile Falls
    ],
    tanzania: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80', // Serengeti plains
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80', // Kilimanjaro majestic mountain with elephants
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80'  // Ngorongoro crater safari
    ],
    czech: [
      'https://images.unsplash.com/photo-1541380742-f361c1106093?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513805959324-96eb66ca8713?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80'
    ],
    slovakia: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'
    ],
    netherlands: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80'
    ],
    belgium: [
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'
    ],
    poland: [
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
    ],
    hungary: [
      'https://images.unsplash.com/photo-1565113915014-ca051e843f51?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549880181-56a44cf8a4a1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80'
    ],
    ukraine: [
      'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558231580-0a8a7ca2c676?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    ],
    bulgaria: [
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80'
    ],
    croatia: [
      'https://images.unsplash.com/photo-1555992336-03a23c7b20eb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510414842594-fc614ea9416f?auto=format&fit=crop&w=800&q=80'
    ],
    austria: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    ],
    tunisia: [
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80'
    ],
    libya: [
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80'
    ],
    'south-sudan': [
      'https://images.unsplash.com/photo-1527269537047-40fbe5034111?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80'
    ],
    somalia: [
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80'
    ]
  };

  return images[countryId]?.[index] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
};

export default function App() {
  // Navigation / View State
  // 'home' = 지리 포털 메인 검색창, 'map' = 세계 지리 인터랙티브 탐색 지도
  const [viewMode, setViewMode] = useState<'home' | 'map'>('home');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countriesData[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContinent, setActiveContinent] = useState<'전체' | '유럽' | '아프리카'>('전체');

  // Autocomplete suggestions dropdown visibility state
  const [showHomeSuggestions, setShowHomeSuggestions] = useState(false);
  const [showMapSuggestions, setShowMapSuggestions] = useState(false);

  // Map Style State
  const [mapTheme, setMapTheme] = useState<'satellite' | 'terrain' | 'default'>('default');
  const [showTelemetry, setShowTelemetry] = useState(true);

  // Handle Google-like search submit
  const handleSearchSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery !== undefined ? customQuery : searchQuery).trim();
    if (!query) return;

    // Find country by name, englishName, or capital
    const found = countriesData.find(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) || 
      c.englishName.toLowerCase().includes(query.toLowerCase()) ||
      c.capital.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setSelectedCountry(found);
      setViewMode('map');
      setSearchQuery(found.name);
      setShowHomeSuggestions(false);
      setShowMapSuggestions(false);
    } else {
      // Show error or keep on home screen with filtered list
      setActiveContinent('전체');
      setSearchQuery(query);
      setViewMode('home');
    }
  };

  // Select country directly from grid or list
  const selectCountryDirect = (country: Country) => {
    setSelectedCountry(country);
    setSearchQuery(country.name);
    setViewMode('map');
    setShowHomeSuggestions(false);
    setShowMapSuggestions(false);
  };

  // Filtering list for main search index
  const filteredHomeCountries = countriesData.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          country.englishName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesContinent = activeContinent === '전체' || country.continent === activeContinent;
    return matchesSearch && matchesContinent;
  });

  return (
    <div id="geography-map-portal" className="min-h-screen bg-[#f1f3f4] text-slate-800 font-sans flex flex-col antialiased">
      
      {/* 1. PORTAL HOME VIEW (Google Maps style search portal with Flag Autocomplete) */}
      {viewMode === 'home' ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto w-full">
          
          {/* Logo Area */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 justify-center mb-4">
              <div className="p-3.5 bg-blue-600 text-white rounded-3xl shadow-lg shadow-blue-100 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                <Map className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-2">
              <span className="text-blue-600">세계</span> 
              <span className="text-slate-800 font-black">지리 사전</span>
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-semibold">
              유럽 & 아프리카 국가들의 경위도 좌표계, 지형적 비밀, 기후를 탐색하는 인터랙티브 지형 학습 백과사전
            </p>
          </div>

          {/* Search Box Wrapper with Dropdown Suggestions */}
          <div className="w-full max-w-2xl relative mb-8">
            <form onSubmit={handleSearchSubmit} className="w-full bg-white rounded-full shadow-lg border border-slate-200 p-2 flex items-center gap-2 focus-within:ring-4 focus-within:ring-blue-500/15 focus-within:border-blue-500 transition-all">
              <div className="flex-1 flex items-center pl-4 gap-3">
                <Search className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowHomeSuggestions(true);
                  }}
                  onFocus={() => setShowHomeSuggestions(true)}
                  placeholder="궁금한 국가명 또는 수도명을 검색해보세요 (예: 영국, 이집트, 로마...)"
                  className="w-full py-2 bg-transparent border-none text-slate-800 font-semibold placeholder:text-slate-400 focus:outline-none text-base"
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowHomeSuggestions(false);
                    }}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 rounded-full text-sm transition-all shadow-md shadow-blue-100 cursor-pointer flex items-center gap-1.5"
              >
                지도로 찾기
              </button>
            </form>

            {/* Suggestions Dropdown with FLAGS shown clearly */}
            {showHomeSuggestions && searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 px-4 uppercase tracking-wider flex items-center justify-between">
                  <span>실시간 국기 검색 매칭 리스트</span>
                  <button onClick={() => setShowHomeSuggestions(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {countriesData
                    .filter(c => 
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      c.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.capital.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(country => (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => {
                          selectCountryDirect(country);
                          setShowHomeSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3.5 hover:bg-blue-50/40 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl filter drop-shadow-sm group-hover:scale-115 transition-transform duration-150" role="img" aria-label={country.name}>
                            {country.flag}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-800 text-sm">{country.name}</span>
                              <span className="text-xs text-slate-400 font-bold">({country.englishName})</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">위치: {getCoordinateRange(country.latitude)}, {getCoordinateRange(country.longitude)}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-xs bg-blue-50 text-blue-600 font-black px-2.5 py-1 rounded-lg border border-blue-100">
                            수도: {country.capital}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1 font-bold">{country.continent} 대륙</span>
                        </div>
                      </button>
                    ))}
                  {countriesData.filter(c => 
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    c.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.capital.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-xs font-bold">
                      일치하는 국가를 찾지 못했습니다. 국어명을 정확히 써보세요! 🌍
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Real-time Flag & Country Preview Card when typing */}
          {searchQuery.trim() !== '' && (
            <div className="w-full max-w-2xl mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
              {(() => {
                const query = searchQuery.trim().toLowerCase();
                const matches = countriesData.filter(c => 
                  c.name.toLowerCase().includes(query) || 
                  c.englishName.toLowerCase().includes(query) ||
                  c.capital.toLowerCase().includes(query)
                );
                
                if (matches.length === 0) {
                  return (
                    <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-md text-center text-slate-500 font-semibold">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <span>일치하는 국가를 찾지 못했습니다. 올바른 한글 국가명을 입력해보세요! (예: 스페인, 영국)</span>
                    </div>
                  );
                }
                
                // Show the top matching country prominently
                const topMatch = matches[0];
                
                return (
                  <div className="bg-white rounded-3xl border-2 border-blue-500 shadow-xl overflow-hidden p-6 hover:shadow-2xl transition-all duration-300 relative">
                    {/* Badge for quick notice */}
                    <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                      실시간 검색 결과
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      {/* Big Flag Box */}
                      <div className="w-48 h-32 bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden group/flag flex-shrink-0">
                        <span className="text-7xl filter drop-shadow-md select-none group-hover/flag:scale-110 transition-transform duration-300" role="img" aria-label={topMatch.name}>
                          {topMatch.flag}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                      </div>

                      {/* Quick Info & CTA */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                          <span className="bg-blue-50 text-blue-700 text-xs font-black px-2.5 py-0.5 rounded-lg border border-blue-100">
                            {topMatch.continent} 대륙
                          </span>
                          <span className="bg-amber-50 text-amber-700 text-xs font-black px-2.5 py-0.5 rounded-lg border border-amber-100">
                            수도: {topMatch.capital}
                          </span>
                        </div>
                        
                        <h3 className="text-3xl font-black text-slate-900 mb-2 flex items-center justify-center md:justify-start gap-2">
                          <span>{topMatch.name}</span>
                          <span className="text-slate-400 text-base font-bold">({topMatch.englishName})</span>
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed font-semibold mb-4">
                          기후: <strong className="text-amber-600">{topMatch.climate}</strong> — {topMatch.climateDesc}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                          <button
                            onClick={() => selectCountryDirect(topMatch)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl text-xs transition-all shadow-md shadow-blue-100 flex items-center gap-2 cursor-pointer active:scale-95 hover:scale-[1.02]"
                          >
                            <Map className="w-4.5 h-4.5" />
                            {topMatch.name} 국기 지도에서 탐험하기
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* If there are other matches */}
                    {matches.length > 1 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 text-center md:text-left">다른 검색 매칭 국가 ({matches.length - 1}):</p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                          {matches.slice(1, 5).map(m => (
                            <button
                              key={m.id}
                              onClick={() => selectCountryDirect(m)}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-xl flex items-center gap-2 transition-colors cursor-pointer text-xs font-bold"
                            >
                              <span>{m.flag}</span>
                              <span className="text-slate-700">{m.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Quick Recommended Categories */}
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500" />
                추천 탐사 지역 (국기를 클릭해 바로 지도에서 탐색해 보세요)
              </h3>
              
              <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5">
                {(['전체', '유럽', '아프리카'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveContinent(tab)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      activeContinent === tab 
                        ? 'bg-white text-blue-600 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Country Cards with Flags */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {filteredHomeCountries.map(country => (
                <button
                  key={country.id}
                  onClick={() => selectCountryDirect(country)}
                  className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-2xl text-left transition-all duration-200 group flex items-center gap-3 cursor-pointer"
                >
                  <span className="text-3xl filter drop-shadow-sm group-hover:scale-115 transition-transform" role="img" aria-label={country.name}>
                    {country.flag}
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-slate-800 truncate">{country.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate">{country.capital}</p>
                  </div>
                </button>
              ))}
            </div>

            {filteredHomeCountries.length === 0 && (
              <div className="text-center py-6 text-slate-400">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-bold">앗! 검색 결과에 해당하는 국가가 없어요. 한글 이름을 정확히 써보세요!</p>
              </div>
            )}
          </div>

          {/* Education Purpose Banner */}
          <div className="w-full max-w-2xl bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-xs text-blue-950">
            <GraduationCap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-900 block mb-0.5">교과서 맞춤형 지리 탐구</span>
              인터랙티브 지도 기반의 지형 탐구 서비스로, 초등학교 6학년 지리 교과 수준의 <strong>기후 대 지형 정보, 특별 지형 유산</strong>을 가독성 높은 입체 지도로 비교 탐색합니다.
            </div>
          </div>

        </div>
      ) : (
        
        /* 2. GOOGLE MAPS STYLE RESULTS VIEW (Left side sidebar / Right side interactive world map) */
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* Top Google Maps styled Floating Search Bar / Header */}
          <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs flex items-center justify-between gap-4 z-30">
            
            {/* Logo Group */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewMode('home')}>
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
                <Map className="w-5 h-5" />
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                <span className="text-blue-600">세계</span> 
                <span>지리 사전</span>
              </h1>
            </div>

            {/* Central Search Bar with Autocomplete suggestions */}
            <div className="flex-1 max-w-lg relative hidden sm:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-blue-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowMapSuggestions(true);
                  }}
                  onFocus={() => setShowMapSuggestions(true)}
                  placeholder="다른 유럽 & 아프리카 국가를 검색해보세요..."
                  className="w-full pl-9 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setSearchQuery('');
                      setShowMapSuggestions(false);
                    }}
                    className="absolute right-3 top-2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {showMapSuggestions && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in duration-100">
                  <div className="max-h-60 overflow-y-auto">
                    {countriesData
                      .filter(c => 
                        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.capital.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(country => (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => {
                            selectCountryDirect(country);
                            setShowMapSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-blue-50/30 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl filter drop-shadow-xs">{country.flag}</span>
                            <div>
                              <span className="font-extrabold text-slate-800 text-xs">{country.name}</span>
                              <span className="text-[10px] text-slate-400 ml-1 font-bold">({country.englishName})</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-2 py-0.5 rounded-lg border border-blue-100">
                            수도: {country.capital}
                          </span>
                        </button>
                      ))}
                    {countriesData.filter(c => 
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      c.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.capital.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        검색 결과가 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Back Button */}
            <button
              onClick={() => setViewMode('home')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              메인 검색창
            </button>
          </div>

          {/* SPLIT PANELS (Left: Geographic Details, Right: Full Screen Map Viewport) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            
            {/* LEFT SIDEBAR: Google Maps Country Profile Panel */}
            <div className="w-full md:w-[420px] bg-white border-r border-slate-200 shadow-xl z-20 flex flex-col h-full overflow-y-auto">
              
              {/* Header Hero Area */}
              <div className="relative bg-slate-50 border-b border-slate-100 p-6 flex flex-col items-center justify-center text-center">
                
                {/* Floating Flag Icon with user query highlighting */}
                <div className="w-32 h-20 bg-white rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center shadow-md mb-3.5 hover:scale-105 transition-transform duration-200 relative group">
                  <span className="text-6xl select-none filter drop-shadow-sm" role="img" aria-label={selectedCountry.name}>
                    {selectedCountry.flag}
                  </span>
                </div>

                <div className="mt-1">
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-blue-100">
                    {selectedCountry.continent} 대륙 국가 지식
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-2 flex items-center justify-center gap-1.5">
                    {selectedCountry.flag} {selectedCountry.name}
                    <span className="text-slate-400 text-sm font-bold">({selectedCountry.englishName})</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-bold mt-1">수도: {selectedCountry.capital}</p>
                </div>

              </div>

              {/* Detailed Geography Profile Section (Factual details focused on Geography, NO safety travel alerts) */}
              <div className="p-5 flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Compass className="w-4 h-4 text-blue-500 animate-pulse" />
                  상세 지리 및 경위도 좌표 정보
                </h3>

                <div className="space-y-2.5 text-xs">
                  {/* Grid of coordinates */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white border border-slate-200/60 p-2.5 rounded-xl flex items-center gap-2">
                      <div className="p-1 bg-blue-50 text-blue-600 rounded-lg">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-black block">위도 범위 (Lat Range)</span>
                        <span className="font-extrabold text-slate-800">{getCoordinateRange(selectedCountry.latitude)}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200/60 p-2.5 rounded-xl flex items-center gap-2">
                      <div className="p-1 bg-blue-50 text-blue-600 rounded-lg">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-black block">경도 범위 (Long Range)</span>
                        <span className="font-extrabold text-slate-800">{getCoordinateRange(selectedCountry.longitude)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Region & Hemisphere Row */}
                  <div className="bg-white border border-slate-200/60 p-3 rounded-xl space-y-2.5">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-slate-400 font-bold text-[10px] mt-0.5 whitespace-nowrap">지형학적 대분류</span>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-800 text-xs block">{selectedCountry.geographicRegion}</span>
                          <span className="text-[9.5px] text-blue-600 font-black bg-blue-50/70 border border-blue-100 px-1.5 py-0.5 rounded-md inline-block mt-1">
                            🌱 초등 6학년 쉬운 설명: {getEasyRegion(selectedCountry.geographicRegion).easyTitle}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10.5px] text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-lg leading-relaxed font-semibold">
                        💡 <span className="text-blue-700 font-bold">도움말:</span> {getEasyRegion(selectedCountry.geographicRegion).description}
                      </p>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold text-[10px]">지구 반구 위치</span>
                      <span className="font-extrabold text-slate-800">{selectedCountry.hemisphere}</span>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold text-[10px]">해발고도 고저차</span>
                      <span className="font-extrabold text-slate-800 text-right">{selectedCountry.elevation}</span>
                    </div>
                  </div>

                  {/* Google Maps External Exploration Button */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCountry.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-blue-100 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>구글 지도로 {selectedCountry.name} 탐색하기</span>
                  </a>

                  {/* 3대 대표 지형물 */}
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                    <span className="text-[10px] text-blue-900 font-black block mb-1.5">⛰️ 초등 지리 3대 대표 지형</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCountry.majorLandforms.map(landform => (
                        <span key={landform} className="bg-white text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg font-black text-[10px] shadow-2xs">
                          {landform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Factual Dictionary Details */}
              <div className="p-5 flex flex-col gap-5 border-b border-slate-100">
                
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  기후 및 영토 지형 백과
                </h3>

                {/* Grid layout */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-black block mb-0.5">총 인구수</span>
                    <span className="text-xs font-extrabold text-slate-800">{selectedCountry.population}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-black block mb-0.5">공식 언어</span>
                    <span className="text-xs font-extrabold text-slate-800 truncate block">{selectedCountry.language}</span>
                  </div>
                </div>

                {/* 1. Climate Info (기후 정보) */}
                <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl flex flex-col gap-1.5">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1">
                    <Sun className="w-4 h-4 text-amber-600 animate-spin-slow" />
                    기후 특성: {selectedCountry.climate}
                  </span>
                  <p className="text-xs text-amber-950 leading-relaxed font-semibold">
                    {selectedCountry.climateDesc}
                  </p>
                </div>

                {/* 2. Geography Details (지형과 영토) */}
                <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-2xl flex flex-col gap-1.5">
                  <span className="text-xs font-black text-sky-900 flex items-center gap-1">
                    <Compass className="w-4 h-4 text-sky-600" />
                    대륙 및 해안 지형 정보
                  </span>
                  <p className="text-xs text-sky-950 leading-relaxed font-semibold">
                    {selectedCountry.geoFeatures}
                  </p>
                </div>

                {/* 3. Special Geo Features (특별한 지리적 특징) */}
                <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-2xl flex flex-col gap-1.5">
                  <span className="text-xs font-black text-blue-900 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    교과서 속 특별한 지리 비밀! 🌟
                  </span>
                  <p className="text-xs text-blue-950 leading-relaxed font-bold">
                    {selectedCountry.specialFeature}
                  </p>
                </div>

              </div>

              {/* NATURAL ENVIRONMENT & LANDMARK HERITAGES SECTION */}
              <div className="p-5 flex flex-col gap-5 bg-slate-50/40 border-t border-slate-100 flex-1 overflow-y-auto max-h-[480px]">
                
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2 flex-shrink-0">
                  <Star className="w-4 h-4 text-emerald-600 animate-pulse" />
                  교과서 속 자연 생태 및 지리 유산
                </h3>

                {/* 1. Natural Environment Detail */}
                <div className="bg-emerald-50/60 border border-emerald-100/80 p-4 rounded-2xl flex flex-col gap-2 shadow-2xs flex-shrink-0">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <span>🌿</span>
                    자연 환경 & 기후 생태계
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    {selectedCountry.naturalEnvironment}
                  </p>
                </div>

                {/* 2. Top 3 Famous Landmarks */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    🗺️ 대표 3대 지리 랜드마크 & 명소
                  </span>
                  <div className="space-y-2.5">
                    {selectedCountry.famousLandmarks.map((landmark, idx) => {
                      const parts = landmark.split(/[\(\[:]/);
                      const title = parts[0]?.trim();
                      const desc = parts[1]?.replace(/[\)\]]/, '').trim();

                      return (
                        <div
                          key={idx}
                          className="w-full bg-white border border-slate-200/80 p-3 rounded-2xl flex gap-3 shadow-3xs hover:border-blue-500/50 hover:shadow-2xs transition-all duration-200 group"
                        >
                          <div className="w-6 h-6 bg-blue-600 text-white font-black rounded-lg flex items-center justify-center text-xs flex-shrink-0 shadow-sm shadow-blue-100">
                            {idx + 1}
                          </div>
                          <div className="text-xs flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-extrabold text-slate-900 truncate">
                                {title}
                              </h4>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(title + ' ' + selectedCountry.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg font-black transition-all border border-blue-100 cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>지도 🗺️</span>
                              </a>
                            </div>
                            {desc && <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-bold">{desc}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT MAIN MAP VIEWPORT: Google Interactive Map */}
            <div className="flex-1 h-full relative bg-[#e8ecef] flex items-center justify-center p-4">
              
              {/* Dynamic Geographical Coordinate Telemetry Dashboard */}
              {showTelemetry ? (
                <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-lg max-w-sm font-sans animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5 gap-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600 animate-spin-slow" />
                      <div>
                        <h4 className="text-xs font-black text-slate-800">지구 위경도 지리좌표 계측</h4>
                        <p className="text-[9px] text-slate-400 font-bold">GRID TELEMETRY SYSTEM</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTelemetry(false)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center cursor-pointer"
                      title="계측기 숨기기"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2.5">
                    {/* Selected Country HUD row */}
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl filter drop-shadow-xs" role="img" aria-label={selectedCountry.name}>{selectedCountry.flag}</span>
                        <div>
                          <span className="text-xs font-black text-slate-800">{selectedCountry.name}</span>
                          <span className="text-[10px] text-slate-400 block font-bold">{selectedCountry.englishName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-black px-2 py-0.5 rounded-full">수도: {selectedCountry.capital}</span>
                        <span className="text-[9px] text-slate-400 block mt-1 font-bold">{selectedCountry.geographicRegion}</span>
                      </div>
                    </div>

                    {/* Lat/Long Telemetry */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white border border-slate-200/60 p-2 rounded-xl text-center shadow-2xs">
                        <span className="text-[9px] text-slate-400 font-black block">위도 범위 (Latitude Range)</span>
                        <span className="text-xs font-extrabold text-blue-600 font-mono">{getCoordinateRange(selectedCountry.latitude)}</span>
                      </div>
                      <div className="bg-white border border-slate-200/60 p-2 rounded-xl text-center shadow-2xs">
                        <span className="text-[9px] text-slate-400 font-black block">경도 범위 (Longitude Range)</span>
                        <span className="text-xs font-extrabold text-blue-600 font-mono">{getCoordinateRange(selectedCountry.longitude)}</span>
                      </div>
                    </div>

                    {/* Hemisphere & Elevation parameters */}
                    <div className="text-[11px] font-semibold text-slate-600 space-y-1 bg-slate-50/50 p-2 rounded-xl">
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400 font-bold">지구 대반구</span>
                        <span className="text-slate-700 font-black">{selectedCountry.hemisphere}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400 font-bold">해발 고도 필터</span>
                        <span className="text-slate-700 font-black text-[10px] truncate max-w-[170px]">{selectedCountry.elevation}</span>
                      </div>
                    </div>

                    {/* Child-friendly Geographic Explanation in Map Mode */}
                    <div className="bg-blue-50/40 border border-blue-100/50 p-2.5 rounded-xl text-[10px] leading-relaxed">
                      <div className="font-extrabold text-blue-900 flex items-center gap-1 mb-1">
                        <span>🌱</span>
                        <span>초등 6학년 쉬운 지형: {getEasyRegion(selectedCountry.geographicRegion).easyTitle}</span>
                      </div>
                      <p className="text-slate-600 font-semibold">
                        {getEasyRegion(selectedCountry.geographicRegion).description}
                      </p>
                    </div>

                    {/* Scale Ruler */}
                    <div className="border-t border-slate-100 pt-2 mt-1">
                      <div className="flex justify-between text-[9px] text-slate-400 font-black mb-1">
                        <span>경도 원점(런던 본초자오선) 기준 자</span>
                        <span>기준 자: 1cm ≒ 400km</span>
                      </div>
                      {/* Visual scale ruler */}
                      <div className="h-2.5 bg-slate-100 rounded-sm overflow-hidden flex border border-slate-200">
                        <div className="w-1/4 bg-slate-800 border-r border-white" />
                        <div className="w-1/4 bg-white border-r border-slate-800" />
                        <div className="w-1/4 bg-slate-800 border-r border-white" />
                        <div className="w-1/4 bg-white" />
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-0.5">
                        <span>0km</span>
                        <span>400km</span>
                        <span>800km</span>
                        <span>1200km</span>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="absolute top-4 left-4 z-10 animate-in fade-in duration-200">
                  <button
                    onClick={() => setShowTelemetry(true)}
                    className="bg-white/95 backdrop-blur-md hover:bg-blue-50 text-slate-800 font-black border border-slate-200 px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                    title="위경도 계측기 켜기"
                  >
                    <Eye className="w-4.5 h-4.5 text-blue-600 animate-pulse" />
                    <span>위경도 계측기 표시</span>
                  </button>
                </div>
              )}

              {/* Map Layout Style Controls (Google Map Control Panel) */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                
                {/* Theme Selector */}
                <div className="bg-white rounded-2xl border border-slate-200 p-1 shadow-md flex flex-col gap-0.5">
                  <button
                    onClick={() => setMapTheme('default')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${
                      mapTheme === 'default' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    일반 지도 (Default)
                  </button>
                  <button
                    onClick={() => setMapTheme('terrain')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${
                      mapTheme === 'terrain' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    지형 물리도 (Terrain)
                  </button>
                  <button
                    onClick={() => setMapTheme('satellite')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${
                      mapTheme === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    위성 지도 (Satellite)
                  </button>
                </div>

                {/* Scale Status Indicator */}
                <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-md text-center text-[10px] text-slate-500 font-bold">
                  <span>지도 그리드 좌표계 자동 대입</span>
                </div>

              </div>

              {/* Dynamic Interactive Google Styled SVG Map */}
              <div className={`w-full max-w-[900px] h-full max-h-[580px] rounded-3xl border border-slate-200 shadow-2xl relative overflow-hidden transition-all duration-500 ${
                mapTheme === 'satellite' ? 'bg-[#0f172a]' : mapTheme === 'terrain' ? 'bg-[#cbe5ff]' : 'bg-[#e0f2fe]'
              }`}>
                
                {/* Floating Map Legend Indicator */}
                <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-md max-w-xs text-[10px] text-slate-600 font-semibold space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] inline-block border border-blue-600" />
                    <span>유럽 대륙 국가 노드</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#fb923c] inline-block border border-orange-600" />
                    <span>아프리카 대륙 국가 노드</span>
                  </div>
                  <div className="h-px bg-slate-200 my-1" />
                  <p className="text-slate-400 italic">경도를 가르는 자오선과 위도선을 마킹했습니다.</p>
                </div>

                {/* SVG Map Canvas */}
                <svg
                  viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                  className="w-full h-full select-none"
                >
                  
                  {/* Detailed Continental Landmasses with realistic shapes */}
                  <g className="transition-all duration-500">
                    
                    {/* 1. Europe Mainland Outline */}
                    <path
                      d="M 150,140 C 180,120 220,110 260,130 C 290,140 310,130 330,120 C 350,110 370,120 390,140 C 410,160 450,150 490,160 C 520,170 540,190 550,210 C 560,240 540,260 510,270 C 480,275 450,265 430,250 C 410,240 390,250 370,260 C 350,270 320,260 300,250 C 280,240 250,250 230,270 C 210,285 190,290 170,280 C 160,260 170,230 180,200 C 190,170 170,150 150,140 Z"
                      fill={mapTheme === 'satellite' ? '#1e293b' : mapTheme === 'terrain' ? '#e2f0d9' : '#f8fafc'}
                      stroke={mapTheme === 'satellite' ? '#334155' : mapTheme === 'terrain' ? '#b8d8a5' : '#cbd5e1'}
                      strokeWidth="2"
                    />
                    
                    {/* 2. Scandinavia Peninsula */}
                    <path
                      d="M 330,120 C 330,80 340,40 370,20 C 400,10 420,30 430,60 C 440,90 420,110 400,130 C 380,150 350,140 330,120 Z"
                      fill={mapTheme === 'satellite' ? '#1e293b' : mapTheme === 'terrain' ? '#d0e1c4' : '#f1f5f9'}
                      stroke={mapTheme === 'satellite' ? '#334155' : mapTheme === 'terrain' ? '#a5c493' : '#cbd5e1'}
                      strokeWidth="2"
                    />

                    {/* 2.5 Iceland Island */}
                    <path
                      d="M 175,55 C 185,50 195,52 205,58 C 210,65 200,73 185,71 C 175,69 168,64 175,55 Z"
                      fill={mapTheme === 'satellite' ? '#334155' : mapTheme === 'terrain' ? '#d4ebd4' : '#f1f5f9'}
                      stroke={mapTheme === 'satellite' ? '#475569' : mapTheme === 'terrain' ? '#adcfa1' : '#94a3b8'}
                      strokeWidth="1.5"
                    />

                    {/* 3. British Isles (UK & Ireland) */}
                    {/* Great Britain */}
                    <path
                      d="M 230,110 C 245,95 260,100 265,115 C 270,130 255,150 245,155 C 235,160 225,140 230,110 Z"
                      fill={mapTheme === 'satellite' ? '#334155' : mapTheme === 'terrain' ? '#d4ebd4' : '#f1f5f9'}
                      stroke={mapTheme === 'satellite' ? '#475569' : mapTheme === 'terrain' ? '#adcfa1' : '#94a3b8'}
                      strokeWidth="1.5"
                    />
                    {/* Ireland */}
                    <path
                      d="M 195,125 C 205,115 215,120 215,135 C 210,145 195,145 195,125 Z"
                      fill={mapTheme === 'satellite' ? '#334155' : mapTheme === 'terrain' ? '#d4ebd4' : '#f1f5f9'}
                      stroke={mapTheme === 'satellite' ? '#475569' : mapTheme === 'terrain' ? '#adcfa1' : '#94a3b8'}
                      strokeWidth="1.5"
                    />

                    {/* 4. Iberian Peninsula (Spain & Portugal) */}
                    <path
                      d="M 170,280 C 190,275 220,280 235,290 C 240,305 220,325 190,325 C 170,320 165,300 170,280 Z"
                      fill={mapTheme === 'satellite' ? '#334155' : mapTheme === 'terrain' ? '#ebd8b0' : '#f1f5f9'}
                      stroke={mapTheme === 'satellite' ? '#475569' : mapTheme === 'terrain' ? '#cca76a' : '#cbd5e1'}
                      strokeWidth="1.5"
                    />

                    {/* 5. Italian Peninsula */}
                    <path
                      d="M 330,245 C 345,250 365,270 375,295 C 378,300 372,305 365,298 C 355,290 340,270 330,245 Z"
                      fill={mapTheme === 'satellite' ? '#334155' : mapTheme === 'terrain' ? '#ebd8b0' : '#f1f5f9'}
                      stroke={mapTheme === 'satellite' ? '#475569' : mapTheme === 'terrain' ? '#cca76a' : '#cbd5e1'}
                      strokeWidth="1.5"
                    />

                    {/* 6. Greece & Balkan Peninsula */}
                    <path
                      d="M 410,250 C 420,255 435,265 445,285 C 448,290 442,295 435,288 C 425,280 415,265 410,250 Z"
                      fill={mapTheme === 'satellite' ? '#334155' : mapTheme === 'terrain' ? '#ebd8b0' : '#f1f5f9'}
                      stroke={mapTheme === 'satellite' ? '#475569' : mapTheme === 'terrain' ? '#cca76a' : '#cbd5e1'}
                      strokeWidth="1.5"
                    />

                    {/* 7. Africa Mainland (Detailed shape) */}
                    <path
                      d="M 175,325 C 220,320 280,325 320,330 C 370,325 430,330 475,350 C 510,365 540,385 570,410 C 585,425 590,440 560,455 C 535,468 515,480 525,510 C 535,530 505,560 485,590 C 465,610 445,610 435,580 C 425,550 415,520 405,490 C 395,460 365,450 335,440 C 305,430 265,420 225,410 C 195,400 165,375 155,355 C 150,335 160,328 175,325 Z"
                      fill={mapTheme === 'satellite' ? '#1e293b' : mapTheme === 'terrain' ? '#f5ebd5' : '#fcfcfc'}
                      stroke={mapTheme === 'satellite' ? '#334155' : mapTheme === 'terrain' ? '#dec8a2' : '#cbd5e1'}
                      strokeWidth="2"
                    />

                    {/* 8. Madagascar Island */}
                    <path
                      d="M 595,515 C 605,495 615,505 625,530 C 620,560 605,575 595,545 Z"
                      fill={mapTheme === 'satellite' ? '#334155' : mapTheme === 'terrain' ? '#e2f0d9' : '#f1f5f9'}
                      stroke={mapTheme === 'satellite' ? '#475569' : mapTheme === 'terrain' ? '#adcfa1' : '#cbd5e1'}
                      strokeWidth="1.5"
                    />
                  </g>

                  {/* Physical Geography Features Layout (Alps, Atlas, Nile, Sahara, Rift Valley) */}
                  {mapTheme === 'terrain' && (
                    <g className="opacity-75 pointer-events-none select-none">
                      {/* Alps Mountains */}
                      <g transform="translate(340, 230)">
                        <polygon points="0,0 -8,-12 -16,0" fill="#a1a1aa" stroke="#52525b" strokeWidth="1" />
                        <polygon points="10,2 2,-15 -6,2" fill="#d4d4d8" stroke="#52525b" strokeWidth="1" />
                        <polygon points="20,5 12,-10 4,5" fill="#a1a1aa" stroke="#52525b" strokeWidth="1" />
                        <text x="6" y="-18" textAnchor="middle" fill="#27272a" className="text-[7px] font-black tracking-wide">알프스 산맥</text>
                      </g>

                      {/* Atlas Mountains */}
                      <g transform="translate(195, 335)">
                        <polygon points="0,0 -6,-10 -12,0" fill="#cca76a" stroke="#854d0e" strokeWidth="0.8" />
                        <polygon points="8,1 2,-12 -4,1" fill="#cca76a" stroke="#854d0e" strokeWidth="0.8" />
                        <text x="4" y="-14" textAnchor="middle" fill="#854d0e" className="text-[7px] font-black tracking-wide">아틀라스 산맥</text>
                      </g>

                      {/* Nile River */}
                      <path
                        d="M 525,490 Q 515,440 500,410 T 480,370"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <text x="502" y="430" fill="#0369a1" className="text-[7px] font-black font-serif italic">나일강 (Nile River)</text>

                      {/* Great Rift Valley */}
                      <path
                        d="M 530,410 Q 540,460 520,500 T 450,580"
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="1.2"
                        strokeDasharray="3,3"
                      />
                      <text x="548" y="475" fill="#991b1b" className="text-[7px] font-black tracking-wider uppercase">지구대 (Rift Valley)</text>

                      {/* Sahara Desert */}
                      <g transform="translate(240, 360)">
                        <text x="30" y="0" fill="#ca8a04" className="text-[12px] font-black tracking-widest opacity-60 italic font-serif">사하라 대사막 (SAHARA DESERT)</text>
                        <path d="M 0,10 Q 15,0 30,10 T 60,10" fill="none" stroke="#eab308" strokeWidth="0.8" opacity="0.5" />
                        <path d="M 120,25 Q 135,15 150,25 T 180,25" fill="none" stroke="#eab308" strokeWidth="0.8" opacity="0.5" />
                      </g>
                    </g>
                  )}

                  {/* LATITUDE GRID LINES (위도선 15도 간격 정밀 마킹) */}
                  {[
                    { y: 80, label: "60° N", kr: "북위 60°" },
                    { y: 220, label: "45° N", kr: "북위 45°" },
                    { y: 350, label: "30° N", kr: "북위 30°" },
                    { y: 440, label: "15° N", kr: "북위 15°" },
                    { y: 490, label: "0° 적도", kr: "적도 (EQUATOR)", color: "#ef4444", width: 2 },
                    { y: 550, label: "15° S", kr: "남위 15°" },
                    { y: 580, label: "30° S", kr: "남위 30°" },
                  ].map((line, idx) => (
                    <g key={`lat-${idx}`} className="opacity-65 select-none pointer-events-none">
                      <line
                        x1="20"
                        y1={line.y}
                        x2="780"
                        y2={line.y}
                        stroke={line.color || (mapTheme === 'satellite' ? '#4f46e5' : '#cbd5e1')}
                        strokeWidth={line.width || 1}
                        strokeDasharray={line.width ? undefined : "3,4"}
                      />
                      <text
                        x="25"
                        y={line.y - 4}
                        fill={line.color || (mapTheme === 'satellite' ? '#818cf8' : '#64748b')}
                        className="text-[9px] font-mono font-black"
                      >
                        {line.label} ({line.kr})
                      </text>
                    </g>
                  ))}

                  {/* LONGITUDE GRID LINES (경도선 15도 간격 정밀 마킹) */}
                  {[
                    { x: 100, label: "30° W", kr: "서경 30°" },
                    { x: 180, label: "15° W", kr: "서경 15°" },
                    { x: 265, label: "0° 본초선", kr: "본초자오선", color: "#10b981", width: 2 },
                    { x: 350, label: "15° E", kr: "동경 15°" },
                    { x: 440, label: "30° E", kr: "동경 30°" },
                    { x: 520, label: "45° E", kr: "동경 45°" },
                    { x: 610, label: "60° E", kr: "동경 60°" },
                  ].map((line, idx) => (
                    <g key={`long-${idx}`} className="opacity-65 select-none pointer-events-none">
                      <line
                        x1={line.x}
                        y1="10"
                        x2={line.x}
                        y2="540"
                        stroke={line.color || (mapTheme === 'satellite' ? '#4f46e5' : '#cbd5e1')}
                        strokeWidth={line.width || 1}
                        strokeDasharray={line.width ? undefined : "3,4"}
                      />
                      <text
                        x={line.x + 4}
                        y="525"
                        fill={line.color || (mapTheme === 'satellite' ? '#818cf8' : '#64748b')}
                        className="text-[9px] font-mono font-black"
                      >
                        {line.label}
                      </text>
                    </g>
                  ))}

                  {/* TROPICS (회귀선 23.5° N/S 정밀 마킹) */}
                  {[
                    { y: 405, label: "Tropic of Cancer (북회귀선 23.5° N)" },
                    { y: 565, label: "Tropic of Capricorn (남회귀선 23.5° S)" },
                  ].map((tropic, idx) => (
                    <g key={`tropic-${idx}`} className="opacity-50 select-none pointer-events-none">
                      <line
                        x1="20"
                        y1={tropic.y}
                        x2="780"
                        y2={tropic.y}
                        stroke="#eab308"
                        strokeWidth="1"
                        strokeDasharray="2,3"
                      />
                      <text
                        x="400"
                        y={tropic.y - 3}
                        textAnchor="middle"
                        fill="#ca8a04"
                        className="text-[8px] font-mono font-black tracking-wider"
                      >
                        {tropic.label}
                      </text>
                    </g>
                  ))}

                  {/* Ocean text markings */}
                  <text x="40" y="270" fill={mapTheme === 'satellite' ? '#475569' : '#0284c7'} className="text-[10px] font-black italic opacity-50 font-mono">대서양 (ATLANTIC OCEAN)</text>
                  <text x="650" y="440" fill={mapTheme === 'satellite' ? '#475569' : '#0284c7'} className="text-[10px] font-black italic opacity-50 font-mono">인도양 (INDIAN OCEAN)</text>
                  <text x="310" y="315" fill={mapTheme === 'satellite' ? '#475569' : '#0284c7'} className="text-[9px] font-extrabold italic opacity-60 font-mono">지중해 (MEDITERRANEAN SEA)</text>

                  {/* Selected Country Active Focus Coordinates Crosshairs & Target Reticle HUD */}
                  <g className="transition-all duration-300">
                    {/* Concentric rings at focal coordinate */}
                    <circle
                      cx={selectedCountry.mapCoords.x}
                      cy={selectedCountry.mapCoords.y}
                      r="35"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="1"
                      strokeDasharray="1,2"
                      className="opacity-40"
                    />
                    
                    {/* Horizontal crosshair */}
                    <line 
                      x1="20" 
                      y1={selectedCountry.mapCoords.y} 
                      x2="780" 
                      y2={selectedCountry.mapCoords.y} 
                      stroke="#4f46e5" 
                      strokeWidth="1.5" 
                      strokeDasharray="4,4" 
                      className="opacity-50"
                    />
                    {/* Vertical crosshair */}
                    <line 
                      x1={selectedCountry.mapCoords.x} 
                      y1="10" 
                      x2={selectedCountry.mapCoords.x} 
                      y2="540" 
                      stroke="#4f46e5" 
                      strokeWidth="1.5" 
                      strokeDasharray="4,4" 
                      className="opacity-50"
                    />

                    {/* Floating HUD reticle badge over the focal point showing coordinates */}
                    <g transform={`translate(${selectedCountry.mapCoords.x}, ${selectedCountry.mapCoords.y + 26})`} className="opacity-95 select-none pointer-events-none">
                      <rect
                        x="-95"
                        y="-8"
                        width="190"
                        height="16"
                        rx="4"
                        fill="#1e1b4b"
                        stroke="#818cf8"
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        y="3"
                        fill="#ffffff"
                        className="text-[8px] font-mono font-black"
                      >
                        GPS: {getCoordinateRange(selectedCountry.latitude)}, {getCoordinateRange(selectedCountry.longitude)}
                      </text>
                    </g>
                  </g>

                  {/* Draw connection lines to neighbors */}
                  {countriesData.map((c) => {
                    return c.surroundingCountries.map(neighName => {
                      const neigh = countriesData.find(n => n.name === neighName);
                      if (neigh && neigh.id > c.id) {
                        return (
                          <line
                            key={`${c.id}-${neigh.id}`}
                            x1={c.mapCoords.x}
                            y1={c.mapCoords.y}
                            x2={neigh.mapCoords.x}
                            y2={neigh.mapCoords.y}
                            stroke={mapTheme === 'satellite' ? '#4338ca' : '#94a3b8'}
                            strokeWidth="1.5"
                            strokeDasharray="3,3"
                            className="opacity-45"
                          />
                        );
                      }
                      return null;
                    });
                  })}

                  {/* Draw Nodes (Markers) for countries with National flags clearly showing */}
                  {countriesData.map((country) => {
                    const isSelected = selectedCountry?.id === country.id;
                    const isEurope = country.continent === '유럽';
                    const nodeColor = isEurope ? '#38bdf8' : '#fb923c';

                    return (
                      <g
                        key={country.id}
                        className="cursor-pointer"
                        onClick={() => selectCountryDirect(country)}
                      >
                        {/* Red high visibility pinpoint icon or pulse ring for SELECTED country */}
                        {isSelected && (
                          <>
                            <circle
                              cx={country.mapCoords.x}
                              cy={country.mapCoords.y}
                              r="26"
                              fill="#ef4444"
                              className="opacity-20 animate-ping"
                            />
                            <circle
                              cx={country.mapCoords.x}
                              cy={country.mapCoords.y}
                              r="16"
                              fill="#ef4444"
                              className="opacity-10 animate-pulse"
                            />
                          </>
                        )}

                        {/* Standard Node Pin */}
                        <circle
                          cx={country.mapCoords.x}
                          cy={country.mapCoords.y}
                          r={isSelected ? "11" : "7"}
                          fill={isSelected ? '#ef4444' : nodeColor}
                          stroke={isSelected ? '#ffffff' : '#1e1b4b'}
                          strokeWidth={isSelected ? "3" : "1.5"}
                          className="transition-all duration-300"
                        />

                        {/* Text Label on Map with National Flag - EXPANDED and high fidelity */}
                        <g transform={`translate(${country.mapCoords.x}, ${country.mapCoords.y - 14})`}>
                          <rect
                            x="-38"
                            y="-9"
                            width="76"
                            height="17"
                            rx="4"
                            fill={isSelected ? '#ef4444' : '#ffffff'}
                            stroke={isSelected ? '#ffffff' : '#cbd5e1'}
                            strokeWidth="1"
                            className="shadow-md"
                          />
                          <text
                            textAnchor="middle"
                            y="3"
                            fill={isSelected ? '#ffffff' : '#0f172a'}
                            className="text-[9.5px] font-black font-sans"
                          >
                            {country.flag} {country.name}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

              </div>

              {/* Associative Search Sidebar - Floating at the Bottom of Map viewport */}
              <div className="absolute bottom-4 right-4 z-10 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl text-white max-w-sm hidden md:block">
                <span className="text-[9px] text-blue-400 font-extrabold uppercase tracking-widest block mb-1">인접 지리 연관 검색어</span>
                <p className="text-xs text-slate-300 mb-3 font-semibold">이웃나라 국기를 누르면 지도가 즉시 포커스 이동해요.</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCountry.surroundingCountries.map(neighName => {
                    const matchedCountry = countriesData.find(c => c.name === neighName);
                    return (
                      <button
                        key={neighName}
                        onClick={() => matchedCountry && selectCountryDirect(matchedCountry)}
                        disabled={!matchedCountry}
                        className={`text-[10px] px-2.5 py-1.5 rounded-full border transition-all ${
                          matchedCountry 
                            ? 'bg-slate-800 border-slate-700 hover:border-blue-400 hover:bg-slate-700 text-white cursor-pointer' 
                            : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {matchedCountry ? matchedCountry.flag : '🌐'} {neighName}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 mt-auto border-t border-slate-800 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-1.5">
          <p className="font-extrabold text-slate-300">🌍 세계 지리 사전 탐색 학습 플랫폼 (초등 6학년 사회과정)</p>
          <p className="text-slate-500 leading-relaxed max-w-2xl mx-auto text-[11px]">
            본 서비스는 초등 교육과정을 효과적으로 시각화하고 학생들이 지형과 기후의 연관성을 스스로 발견할 수 있도록 돕는 인터랙티브 백과사전입니다.
          </p>
          <p className="text-slate-600 text-[10px]">© 2026 World Geography Interactive Platform. All Rights Reserved.</p>
        </div>
      </footer>

    </div>
  );
}
