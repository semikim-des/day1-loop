import React, { useState, useEffect, useRef } from 'react';

// ==================== 유틸리티 함수 ====================

// Haversine 공식으로 거리 계산 (미터 단위)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Google Sheets API를 통해 배지 정보 업데이트
const updateBadgeOnGoogleSheets = async (userName, badgeName, apiKey, spreadsheetId) => {
  try {
    // 참고: 클라이언트 측 Google Sheets API 직접 호출은 CORS 문제가 있을 수 있습니다.
    // 프로덕션에서는 백엔드 프록시를 사용하는 것을 권장합니다.

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1?key=${apiKey}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[userName, badgeName, 'TRUE', new Date().toISOString()]],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Google Sheets API 요청 실패');
    }

    return await response.json();
  } catch (error) {
    console.error('배지 업데이트 실패:', error);
    // 로컬 저장소에만 저장
    return null;
  }
};

// 도트 스타일 포켓몬 주인공 그리기
const DotCharacter = ({ x = 100, y = 100, size = 16 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const scale = size / 16; // 원본 16x16 픽셀 기준

    // 배경 투명
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 픽셀 스타일로 포켓몬 주인공 캐릭터 (간단한 버전)
    // 피부색 (살구색)
    ctx.fillStyle = '#F5A962';
    // 머리
    ctx.fillRect(6 * scale, 2 * scale, 4 * scale, 3 * scale);
    // 몸
    ctx.fillRect(5 * scale, 5 * scale, 6 * scale, 7 * scale);
    // 팔
    ctx.fillRect(4 * scale, 6 * scale, 1 * scale, 5 * scale);
    ctx.fillRect(11 * scale, 6 * scale, 1 * scale, 5 * scale);
    // 다리
    ctx.fillRect(5 * scale, 12 * scale, 2 * scale, 4 * scale);
    ctx.fillRect(9 * scale, 12 * scale, 2 * scale, 4 * scale);

    // 검은 윤곽
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = scale;
    ctx.strokeRect(6 * scale, 2 * scale, 4 * scale, 3 * scale); // 머리
    ctx.strokeRect(5 * scale, 5 * scale, 6 * scale, 7 * scale); // 몸

  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

// ==================== 메인 게임 컴포넌트 ====================

export default function GameApp() {
  // GPS 및 위치 상태
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [nearbyGym, setNearbyGym] = useState(null);
  const [distances, setDistances] = useState({});

  // 배틀 상태
  const [inBattle, setInBattle] = useState(false);
  const [currentBattle, setCurrentBattle] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(100);

  // 배지 상태
  const [badges, setBadges] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  // Google Sheets 설정
  const [apiKey, setApiKey] = useState(localStorage.getItem('gsheets_api_key') || '');
  const [spreadsheetId, setSpreadsheetId] = useState(localStorage.getItem('gsheets_id') || '');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 거점 데이터
  const gyms = [
    {
      id: 'centerfield',
      name: '센터필드 본부',
      coords: { lat: 37.5038, lng: 127.0428 },
      boss: '신입 트레이너',
      reward: '센터필드 배지',
      color: '#4CAF50',
    },
    {
      id: 'gangnam',
      name: '강남역 챌린지',
      coords: { lat: 37.4979, lng: 127.0276 },
      boss: '강남역 관장',
      reward: '도시의 열정 배지',
      color: '#FF9800',
    },
    {
      id: 'seollung',
      name: '선릉 산책길',
      coords: { lat: 37.5051, lng: 127.0480 },
      boss: '선릉 수호자',
      reward: '푸른 숲 배지',
      color: '#2196F3',
    },
  ];

  // GPS 위치 추적
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('이 브라우저는 GPS를 지원하지 않습니다.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError(`GPS 오류: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 거리 계산 및 근처 체육관 감지
  useEffect(() => {
    if (!userLocation) return;

    const newDistances = {};
    let closestGym = null;
    let minDistance = Infinity;

    gyms.forEach((gym) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        gym.coords.lat,
        gym.coords.lng
      );

      newDistances[gym.id] = distance;

      if (distance < minDistance) {
        minDistance = distance;
        closestGym = distance <= 50 ? gym : null;
      }
    });

    setDistances(newDistances);
    setNearbyGym(closestGym);

    // 50m 이내에 있으면 자동으로 배틀 모드 시작
    if (closestGym && !inBattle) {
      setCurrentBattle(closestGym);
      setInBattle(true);
      setPlayerHP(100);
      setBossHP(100);
      setBattleLog([
        `${closestGym.boss}가 나타났다!`,
        `${closestGym.name}의 ${closestGym.boss}과(와)의 배틀 시작!`,
      ]);
    }
  }, [userLocation]);

  // 배지 로컬 스토리지에서 로드
  useEffect(() => {
    const saved = localStorage.getItem('badges');
    if (saved) {
      setBadges(JSON.parse(saved));
    }
  }, []);

  // 배틀 공격
  const attackBoss = () => {
    const damage = Math.floor(Math.random() * 20) + 10;
    const newBossHP = Math.max(0, bossHP - damage);
    setBossHP(newBossHP);

    const newLog = [...battleLog, `플레이어 공격! ${damage}의 데미지!`];

    if (newBossHP <= 0) {
      newLog.push(`${currentBattle.boss}을(를) 물리쳤다!`);
      newLog.push(`배지를 얻었다! - ${currentBattle.reward}`);

      // 배지 저장
      const newBadges = {
        ...badges,
        [currentBattle.id]: true,
      };
      setBadges(newBadges);
      localStorage.setItem('badges', JSON.stringify(newBadges));

      // Google Sheets에 업데이트 시도
      if (apiKey && spreadsheetId) {
        updateBadgeOnGoogleSheets(
          'player',
          currentBattle.reward,
          apiKey,
          spreadsheetId
        );
      }

      setLastUpdate(new Date().toLocaleTimeString());

      // 2초 후 배틀 종료
      setTimeout(() => {
        setInBattle(false);
        setCurrentBattle(null);
      }, 2000);
    } else {
      // 보스 반격
      const bossDamage = Math.floor(Math.random() * 15) + 5;
      const newPlayerHP = Math.max(0, playerHP - bossDamage);
      setPlayerHP(newPlayerHP);
      newLog.push(`${currentBattle.boss}의 반격! ${bossDamage}의 데미지!`);

      if (newPlayerHP <= 0) {
        newLog.push('패배... 다시 도전하세요!');
        setTimeout(() => {
          setInBattle(false);
          setCurrentBattle(null);
        }, 2000);
      }
    }

    setBattleLog(newLog);
  };

  // 배틀 도망
  const fleeBattle = () => {
    setInBattle(false);
    setCurrentBattle(null);
    setBattleLog([]);
  };

  // 설정 저장
  const saveSettings = () => {
    localStorage.setItem('gsheets_api_key', apiKey);
    localStorage.setItem('gsheets_id', spreadsheetId);
    setSettingsOpen(false);
    alert('설정이 저장되었습니다.');
  };

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      {/* 헤더 */}
      <div style={styles.header}>
        <h1 style={styles.title}>따릉몬: 강남 에디션</h1>
        <button
          style={styles.settingsBtn}
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          ⚙️ 설정
        </button>
      </div>

      {/* 설정 패널 */}
      {settingsOpen && (
        <div style={styles.settingsPanel}>
          <h3>Google Sheets 설정</h3>
          <div style={styles.inputGroup}>
            <label>API 키:</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Google Sheets API 키 입력"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label>스프레드시트 ID:</label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="스프레드시트 ID 입력"
              style={styles.input}
            />
          </div>
          <button style={styles.saveBtn} onClick={saveSettings}>
            저장
          </button>
          <p style={styles.helpText}>
            ℹ️ Google Cloud Console에서 Sheets API를 활성화하고 API 키를 생성해야 합니다.
          </p>
        </div>
      )}

      {/* 위치 정보 */}
      <div style={styles.locationInfo}>
        {locationError && <p style={styles.error}>{locationError}</p>}
        {userLocation && (
          <p style={styles.coords}>
            📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        )}
      </div>

      {/* 배틀 모드 */}
      {inBattle && currentBattle ? (
        <div style={styles.battleContainer}>
          <div style={styles.battleHeader}>
            <h2>⚔️ 배틀 시작!</h2>
          </div>

          <div style={styles.battleArena}>
            {/* 보스 캐릭터 */}
            <div style={styles.bossArea}>
              <div style={styles.pixelBoss}>{currentBattle.boss}</div>
              <div style={styles.hpBar}>
                <div
                  style={{
                    ...styles.hpFill,
                    width: `${(bossHP / 100) * 100}%`,
                    backgroundColor: bossHP > 30 ? '#FF6B6B' : '#FFA94D',
                  }}
                />
              </div>
              <p>{bossHP} / 100 HP</p>
            </div>

            {/* 플레이어 캐릭터 */}
            <div style={styles.playerArea}>
              <div style={styles.playerCharacter}>
                <DotCharacter size={40} />
              </div>
              <div style={styles.hpBar}>
                <div
                  style={{
                    ...styles.hpFill,
                    width: `${(playerHP / 100) * 100}%`,
                    backgroundColor: playerHP > 30 ? '#4CAF50' : '#FFA94D',
                  }}
                />
              </div>
              <p>{playerHP} / 100 HP</p>
            </div>
          </div>

          {/* 배틀 로그 */}
          <div style={styles.battleLog}>
            {battleLog.map((log, idx) => (
              <p key={idx}>{log}</p>
            ))}
          </div>

          {/* 배틀 버튼 */}
          {playerHP > 0 && bossHP > 0 && (
            <div style={styles.battleButtons}>
              <button
                style={{ ...styles.battleBtn, backgroundColor: '#4CAF50' }}
                onClick={attackBoss}
              >
                ⚡ 공격
              </button>
              <button
                style={{ ...styles.battleBtn, backgroundColor: '#FF9800' }}
                onClick={fleeBattle}
              >
                🏃 도망
              </button>
            </div>
          )}

          {playerHP <= 0 && (
            <button style={styles.closeBtn} onClick={fleeBattle}>
              닫기
            </button>
          )}
        </div>
      ) : (
        /* 맵 뷰 */
        <div style={styles.mapContainer}>
          <div style={styles.mapBackground}>
            {/* 거점 마커 */}
            {gyms.map((gym) => (
              <div
                key={gym.id}
                style={{
                  ...styles.gymMarker,
                  backgroundColor: gym.color,
                  opacity: distances[gym.id] && distances[gym.id] <= 50 ? 1 : 0.6,
                  transform:
                    distances[gym.id] && distances[gym.id] <= 50
                      ? 'scale(1.2)'
                      : 'scale(1)',
                  boxShadow:
                    distances[gym.id] && distances[gym.id] <= 50
                      ? `0 0 20px ${gym.color}`
                      : 'none',
                }}
              >
                {gym.name.substring(0, 2)}
              </div>
            ))}

            {/* 플레이어 마커 */}
            <div style={styles.playerMarker}>
              <DotCharacter size={24} />
            </div>
          </div>

          {/* 거점 정보 */}
          <div style={styles.gymInfo}>
            <h3>📍 주변 거점</h3>
            {gyms.map((gym) => {
              const distance = distances[gym.id];
              const isNearby = distance && distance <= 50;
              return (
                <div
                  key={gym.id}
                  style={{
                    ...styles.gymItem,
                    borderLeft: `4px solid ${gym.color}`,
                    backgroundColor: isNearby ? '#FFF9C4' : '#F5F5F5',
                  }}
                >
                  <h4>{gym.name}</h4>
                  <p>관장: {gym.boss}</p>
                  <p>보상: {gym.reward}</p>
                  {distance && (
                    <p style={isNearby ? styles.nearby : {}}>
                      거리: {distance.toFixed(1)}m
                      {isNearby && ' ✨ 근처!'}
                    </p>
                  )}
                  {badges[gym.id] && <p style={styles.badgeGot}>✅ 배지 획득</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 배지 표시 */}
      <div style={styles.badgeDisplay}>
        <h3>🏅 획득한 배지</h3>
        <div style={styles.badgeList}>
          {gyms.map((gym) => (
            <div
              key={gym.id}
              style={{
                ...styles.badgeItem,
                opacity: badges[gym.id] ? 1 : 0.3,
              }}
            >
              {gym.reward}
              {badges[gym.id] && '✓'}
            </div>
          ))}
        </div>
        {lastUpdate && (
          <p style={styles.lastUpdate}>마지막 업데이트: {lastUpdate}</p>
        )}
      </div>
    </div>
  );
}

// ==================== 스타일 ====================

const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'Press Start 2P', monospace;
    background: linear-gradient(135deg, #2d5016 0%, #1a1a1a 100%);
    color: #333;
  }
`;

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#1a1a1a',
    color: '#00FF00',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '10px',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '4px solid #00FF00',
    paddingBottom: '10px',
  },
  title: {
    margin: 0,
    color: '#00FF00',
    textShadow: '2px 2px 0px #00AA00',
    fontSize: '16px',
  },
  settingsBtn: {
    padding: '8px 12px',
    backgroundColor: '#FF6B6B',
    border: '2px solid #00FF00',
    color: '#000',
    fontFamily: "'Press Start 2P', monospace",
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  settingsPanel: {
    backgroundColor: '#2a2a2a',
    border: '4px solid #00FF00',
    padding: '15px',
    marginBottom: '20px',
    color: '#00FF00',
  },
  inputGroup: {
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    backgroundColor: '#1a1a1a',
    border: '2px solid #00FF00',
    color: '#00FF00',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '8px',
  },
  saveBtn: {
    padding: '8px 12px',
    backgroundColor: '#4CAF50',
    border: '2px solid #00FF00',
    color: '#000',
    fontFamily: "'Press Start 2P', monospace",
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  helpText: {
    marginTop: '10px',
    color: '#FFA500',
    fontSize: '8px',
  },
  locationInfo: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#00FF00',
  },
  coords: {
    margin: '0',
    fontSize: '10px',
  },
  error: {
    color: '#FF6B6B',
    margin: '0',
  },
  mapContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '20px',
    marginBottom: '20px',
  },
  mapBackground: {
    position: 'relative',
    width: '100%',
    height: '400px',
    backgroundColor: '#4a5f4a',
    border: '4px solid #00FF00',
    backgroundImage: `
      linear-gradient(90deg, #2d5016 25%, transparent 25%),
      linear-gradient(#2d5016 25%, transparent 25%)
    `,
    backgroundSize: '20px 20px',
    overflow: 'hidden',
  },
  gymMarker: {
    position: 'absolute',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '12px',
    border: '2px solid #000',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  playerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
  },
  gymInfo: {
    backgroundColor: '#2a2a2a',
    border: '4px solid #00FF00',
    padding: '15px',
    maxHeight: '400px',
    overflowY: 'auto',
    color: '#00FF00',
  },
  gymItem: {
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#1a1a1a',
    color: '#00FF00',
  },
  nearby: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  badgeGot: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  battleContainer: {
    backgroundColor: '#2a2a2a',
    border: '4px solid #FF6B6B',
    padding: '20px',
    marginBottom: '20px',
    color: '#FF6B6B',
  },
  battleHeader: {
    textAlign: 'center',
    borderBottom: '2px solid #FF6B6B',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  battleArena: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    marginBottom: '20px',
  },
  bossArea: {
    textAlign: 'center',
  },
  playerArea: {
    textAlign: 'center',
  },
  pixelBoss: {
    backgroundColor: '#444',
    border: '2px solid #FF6B6B',
    padding: '20px',
    marginBottom: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  playerCharacter: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  hpBar: {
    width: '100%',
    height: '15px',
    backgroundColor: '#000',
    border: '2px solid #FF6B6B',
    marginBottom: '5px',
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  battleLog: {
    backgroundColor: '#1a1a1a',
    border: '2px solid #FF6B6B',
    padding: '10px',
    height: '100px',
    overflowY: 'auto',
    marginBottom: '15px',
    color: '#00FF00',
    fontSize: '8px',
  },
  battleButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  battleBtn: {
    padding: '15px',
    border: '2px solid #000',
    color: '#000',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  closeBtn: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#666',
    border: '2px solid #FF6B6B',
    color: '#FFF',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  badgeDisplay: {
    backgroundColor: '#2a2a2a',
    border: '4px solid #FFD700',
    padding: '15px',
    color: '#FFD700',
  },
  badgeList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
    marginBottom: '10px',
  },
  badgeItem: {
    backgroundColor: '#1a1a1a',
    border: '2px solid #FFD700',
    padding: '10px',
    textAlign: 'center',
    fontSize: '10px',
    transition: 'opacity 0.3s ease',
  },
  lastUpdate: {
    fontSize: '8px',
    color: '#888',
    margin: '10px 0 0 0',
  },
};
