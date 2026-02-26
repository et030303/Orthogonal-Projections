// ... (기존 상단 import 및 상태 정의 동일)

  // --- 수식 표시를 위한 로직 추가 ---
  let originalValue = 0, valueLabel = '', symbol = '', formula = '';
  
  if (!is3D) {
    if (shape === 'line') { 
      originalValue = lineLen; 
      valueLabel = '길이'; 
      symbol = 'l';
      formula = `${symbol}' = ${symbol} × cos(θ)`;
    }
    else if (shape === 'circle') { 
      originalValue = Math.PI * Math.pow(circleRad, 2); 
      valueLabel = '넓이'; 
      symbol = 'S';
      formula = `${symbol}' = ${symbol} × cos(θ)`;
    }
    else if (shape === 'rect') { 
      originalValue = rectW * rectH; 
      valueLabel = '넓이'; 
      symbol = 'S';
      formula = `${symbol}' = ${symbol} × cos(θ)`;
    }
    else if (shape === 'triangle') { 
      originalValue = (rectW * rectH) / 2; 
      valueLabel = '넓이'; 
      symbol = 'S';
      formula = `${symbol}' = ${symbol} × cos(θ)`;
    }
  }
  const projectedValue = (originalValue * cosValue).toFixed(2);
  const displayOriginal = originalValue.toFixed(2);

  // ... (중략)

  // --- UI 렌더링 부분 (결과창 수정) ---
  <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '10px', borderLeft: is3D ? '5px solid #9b59b6' : '5px solid #3498db', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
    {!is3D ? (
      <>
        <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px dashed #eee' }}>
          <span style={{ fontSize: '12px', color: '#95a5a6', fontWeight: 'bold' }}>정사영 공식: </span>
          <code style={{ fontSize: '14px', color: '#e74c3c', fontWeight: 'bold', backgroundColor: '#fff5f5', padding: '2px 6px', borderRadius: '4px' }}>
            {formula}
          </code>
        </div>
        <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '13px' }}>
          원래 {valueLabel} ({symbol}): {displayOriginal}
        </p>
        <h3 style={{ margin: 0, color: '#2980b9', fontSize: '18px' }}>
          {symbol}' = {displayOriginal} × {cosValue.toFixed(3)} = <span style={{color: '#27ae60'}}>{projectedValue}</span>
        </h3>
      </>
    ) : (
      <p style={{ margin: 0, color: '#8e44ad', fontSize: '13px', fontWeight: 'bold' }}>[입체도형 모드] 높이 조절이 자유롭습니다.</p>
    )}
  </div>

// ... (이하 동일)
